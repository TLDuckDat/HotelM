package org.example.hotelm.kpi.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.kpi.dto.KPIResponse;
import org.example.hotelm.kpi.dto.KPITargetRequest;
import org.example.hotelm.kpi.service.KPIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/kpi")
@RequiredArgsConstructor
public class KPIController {

    private final KPIService kpiService;


    @GetMapping("/branch/{branchId}")
    public ResponseEntity<KPIResponse> getKPIByBranchAndMonth(
            @PathVariable String branchId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(kpiService.getKPIByBranchAndMonth(branchId, year, month));
    }


    @GetMapping("/branch/{branchId}/history")
    public ResponseEntity<List<KPIResponse>> getKPIHistory(@PathVariable String branchId) {
        return ResponseEntity.ok(kpiService.getKPIHistoryByBranch(branchId));
    }


    @GetMapping("/all")
    public ResponseEntity<List<KPIResponse>> getAllBranchesKPI(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(kpiService.getAllBranchesKPIForMonth(year, month));
    }


    @PostMapping("/target")
    public ResponseEntity<KPIResponse> setTarget(@Valid @RequestBody KPITargetRequest request) {
        return ResponseEntity.ok(kpiService.setRevenueTarget(request));
    }

    // POST /kpi/recalculate/{branchId}?year=2025&month=4
    @PostMapping("/recalculate/{branchId}")
    public ResponseEntity<KPIResponse> recalculate(
            @PathVariable String branchId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(kpiService.recalculateKPI(branchId, year, month));
    }
}