package org.example.hotelm.review.dto;

import java.time.LocalDateTime;

public record ReviewResponse(
        String reviewId,
        String userId,
        String roomId,
        int rating,
        String comment,
        LocalDateTime createdAt
) {}