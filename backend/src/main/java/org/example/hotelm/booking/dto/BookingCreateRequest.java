package org.example.hotelm.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record BookingCreateRequest(
        @NotBlank(message = "User ID is required")
        String userId,
        @NotBlank(message = "Room ID is required")
        String roomId,
        @NotNull(message = "Check-in is required")
        LocalDateTime checkIn,
        @NotNull(message = "Check-out is required")
        LocalDateTime checkOut,
        String note
) {}

