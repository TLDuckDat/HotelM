package org.example.hotelm.review.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        String reviewId,
        String userId,
        String userName,
        String userEmail,
        String roomId,
        String roomName,
        String bookingId,
        int rating,
        String comment,
        String status,
        LocalDateTime createdAt
) {}