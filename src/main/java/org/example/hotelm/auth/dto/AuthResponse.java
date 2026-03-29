package org.example.hotelm.auth.dto;

public record AuthResponse(
        String accessToken,
        String tokenType,
        String userId,
        String email
) {}

