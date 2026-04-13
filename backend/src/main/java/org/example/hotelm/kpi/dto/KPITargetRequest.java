package org.example.hotelm.kpi.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record KPITargetRequest(
        @NotBlank(message = "Branch ID is required")
        String branchId,

        @NotNull @Min(1) int year,
        @NotNull @Min(1) int month,

        double revenueTarget
) {}