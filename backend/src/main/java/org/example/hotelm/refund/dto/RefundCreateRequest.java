package org.example.hotelm.refund.dto;

import jakarta.validation.constraints.NotBlank;

public record RefundCreateRequest(
        @NotBlank(message = "Booking ID is required")
        String bookingId,
        @NotBlank(message = "User ID is required")
        String userId,
        @NotBlank(message = "Refund reason is required")
        String reason
) {
}

