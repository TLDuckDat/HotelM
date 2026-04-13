package org.example.hotelm.kpi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hotelm.branch.entity.Branch;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class BranchKPI {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String kpiId;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    private int year;
    private int month;

    // Doanh thu thực tế (tính từ Invoice)
    private double totalRevenue;

    // Mục tiêu doanh thu đặt ra
    private double revenueTarget;

    // Số booking trong tháng
    private int totalBookings;

    // Tỉ lệ lấp đầy phòng (%)
    private double occupancyRate;

    // Điểm đánh giá trung bình từ Review
    private double averageRating;
}