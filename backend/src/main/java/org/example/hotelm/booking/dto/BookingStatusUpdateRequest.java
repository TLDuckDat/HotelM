package org.example.hotelm.booking.dto;

import jakarta.validation.constraints.NotNull;
import org.example.hotelm.booking.entity.Booking;

public record BookingStatusUpdateRequest(

        @NotNull(message = "Status is required")
        Booking.BookingStatus status
) {}

