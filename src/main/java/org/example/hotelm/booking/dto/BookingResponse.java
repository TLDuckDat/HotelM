package org.example.hotelm.booking.dto;

import org.example.hotelm.booking.entity.Booking;

import java.time.LocalDateTime;

public record BookingResponse(
        String bookingId,
        String userId,
        String roomId,
        LocalDateTime checkIn,
        LocalDateTime checkOut,
        double totalPrice,
        Booking.BookingStatus status,
        LocalDateTime createdAt,
        String note
) {}

