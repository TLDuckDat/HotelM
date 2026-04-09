package org.example.hotelm.user.dto;

import org.example.hotelm.user.entity.User;

import java.time.LocalDate;

public record UserResponse(
        String userId,
        String fullName,
        String phoneNumber,
        String email,
        User.Role role,
        LocalDate createdAt,
        User.UserStatus status
) {
}
