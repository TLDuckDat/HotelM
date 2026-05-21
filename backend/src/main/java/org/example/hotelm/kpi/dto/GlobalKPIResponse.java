package org.example.hotelm.kpi.dto;

public record GlobalKPIResponse(
        int year,
        int month,
        double totalRevenue,
        long totalBookings,
        double averageOccupancyRate,
        double averageRating,
        int totalBranches
) {}
