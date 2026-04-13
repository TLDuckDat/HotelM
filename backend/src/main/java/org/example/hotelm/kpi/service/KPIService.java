package org.example.hotelm.kpi.service;

import org.example.hotelm.kpi.dto.KPIResponse;
import org.example.hotelm.kpi.dto.KPITargetRequest;

import java.util.List;

public interface KPIService {

    KPIResponse getKPIByBranchAndMonth(String branchId, int year, int month);

    List<KPIResponse> getKPIHistoryByBranch(String branchId);

    List<KPIResponse> getAllBranchesKPIForMonth(int year, int month);

    KPIResponse setRevenueTarget(KPITargetRequest request);

    KPIResponse recalculateKPI(String branchId, int year, int month);
}