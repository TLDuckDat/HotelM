package org.example.hotelm.kpi.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.repository.BookingRepository;
import org.example.hotelm.branch.entity.Branch;
import org.example.hotelm.branch.repository.BranchRepository;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.invoice.repository.InvoiceRepository;
import org.example.hotelm.kpi.dto.GlobalKPIResponse;
import org.example.hotelm.kpi.dto.KPIResponse;
import org.example.hotelm.kpi.dto.KPITargetRequest;
import org.example.hotelm.kpi.entity.BranchKPI;
import org.example.hotelm.kpi.repository.BranchKPIRepository;
import org.example.hotelm.kpi.service.KPIService;
import org.example.hotelm.review.repository.ReviewRepository;
import org.example.hotelm.room.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KPIServiceImpl implements KPIService {

    private final BranchKPIRepository kpiRepository;
    private final BranchRepository branchRepository;
    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final ReviewRepository reviewRepository;

    @Override
    public KPIResponse getKPIByBranchAndMonth(String branchId, int year, int month) {
        BranchKPI kpi = kpiRepository
                .findByBranch_BranchIdAndYearAndMonth(branchId, year, month)
                .orElseGet(() -> recalculateAndSave(branchId, year, month));
        return toResponse(kpi);
    }

    @Override
    public List<KPIResponse> getKPIHistoryByBranch(String branchId) {
        return kpiRepository.findByBranch_BranchId(branchId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<KPIResponse> getAllBranchesKPIForMonth(int year, int month) {
        // Đảm bảo tất cả chi nhánh đều có dữ liệu KPI cho tháng đó
        List<Branch> branches = branchRepository.findAll();
        for (Branch b : branches) {
            if (kpiRepository.findByBranch_BranchIdAndYearAndMonth(b.getBranchId(), year, month).isEmpty()) {
                recalculateAndSave(b.getBranchId(), year, month);
            }
        }
        return kpiRepository.findByYearAndMonth(year, month).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public KPIResponse setRevenueTarget(KPITargetRequest request) {
        Branch branch = branchRepository.findById(request.branchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + request.branchId()));

        BranchKPI kpi = kpiRepository
                .findByBranch_BranchIdAndYearAndMonth(request.branchId(), request.year(), request.month())
                .orElseGet(() -> {
                    BranchKPI newKpi = new BranchKPI();
                    newKpi.setBranch(branch);
                    newKpi.setYear(request.year());
                    newKpi.setMonth(request.month());
                    return newKpi;
                });

        kpi.setRevenueTarget(request.revenueTarget());
        return toResponse(kpiRepository.save(kpi));
    }

    @Override
    public KPIResponse recalculateKPI(String branchId, int year, int month) {
        return toResponse(recalculateAndSave(branchId, year, month));
    }

    @Override
    public GlobalKPIResponse getGlobalSummary(int year, int month) {
        Double totalRevenue = invoiceRepository.sumGlobalRevenueByMonth(year, month);
        long totalBookings = bookingRepository.countGlobalByMonth(year, month);
        Double avgRating = reviewRepository.avgGlobalRating();
        
        List<BranchKPI> monthlyKpis = kpiRepository.findByYearAndMonth(year, month);
        double avgOccupancy = monthlyKpis.stream()
                .mapToDouble(BranchKPI::getOccupancyRate)
                .average()
                .orElse(0.0);

        return new GlobalKPIResponse(
                year,
                month,
                totalRevenue != null ? totalRevenue : 0.0,
                totalBookings,
                avgOccupancy,
                avgRating != null ? avgRating : 0.0,
                (int) branchRepository.count()
        );
    }

    private BranchKPI recalculateAndSave(String branchId, int year, int month) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh: " + branchId));

        BranchKPI kpi = kpiRepository
                .findByBranch_BranchIdAndYearAndMonth(branchId, year, month)
                .orElseGet(() -> {
                    BranchKPI newKpi = new BranchKPI();
                    newKpi.setBranch(branch);
                    newKpi.setYear(year);
                    newKpi.setMonth(month);
                    return newKpi;
                });

        // Sử dụng query đã tối ưu
        Double totalRevenue = invoiceRepository.sumRevenueByBranchAndMonth(branchId, year, month);
        long totalBookings = bookingRepository.countByBranchAndMonth(branchId, year, month);
        long totalRooms = roomRepository.countByBranch_BranchId(branchId);
        Double avgRating = reviewRepository.avgRatingByBranch(branchId);

        // Tỉ lệ lấp đầy = booking / (rooms * days_in_month)
        int daysInMonth = java.time.YearMonth.of(year, month).lengthOfMonth();
        double occupancyRate = totalRooms > 0
                ? Math.min(100.0, (totalBookings * 100.0) / (totalRooms * daysInMonth))
                : 0;

        kpi.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);
        kpi.setTotalBookings((int) totalBookings);
        kpi.setOccupancyRate(occupancyRate);
        kpi.setAverageRating(avgRating != null ? avgRating : 0.0);

        return kpiRepository.save(kpi);
    }

    private KPIResponse toResponse(BranchKPI kpi) {
        double achievementRate = kpi.getRevenueTarget() > 0
                ? (kpi.getTotalRevenue() / kpi.getRevenueTarget()) * 100
                : 0;

        return new KPIResponse(
                kpi.getKpiId(),
                kpi.getBranch() == null ? null : kpi.getBranch().getBranchId(),
                kpi.getBranch() == null ? null : kpi.getBranch().getBranchName(),
                kpi.getYear(),
                kpi.getMonth(),
                kpi.getTotalRevenue(),
                kpi.getRevenueTarget(),
                achievementRate,
                kpi.getTotalBookings(),
                kpi.getOccupancyRate(),
                kpi.getAverageRating()
        );
    }
}