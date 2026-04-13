package org.example.hotelm.kpi.dto;

public record KPIResponse(

        String kpiId,
        String branchId,
        String branchName,
        int year,
        int month,
        double totalRevenue,
        double revenueTarget,
        double revenueAchievementRate,   // % đạt được so với target
        int totalBookings,
        double occupancyRate,
        double averageRating
) {}