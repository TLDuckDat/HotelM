package org.example.hotelm.refund.dto;

import org.example.hotelm.refund.entity.RefundRequest;

import java.time.LocalDateTime;

public record RefundResponse(
        String refundId,
        String bookingId,
        String userId,
        String userName,
        String reason,
        RefundRequest.RefundStatus status,
        LocalDateTime createdAt,
        LocalDateTime reviewedAt
) {
}

