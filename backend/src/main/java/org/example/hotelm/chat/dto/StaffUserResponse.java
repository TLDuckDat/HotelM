package org.example.hotelm.chat.dto;

import org.example.hotelm.user.entity.User;

public record StaffUserResponse(
        String userId,
        String fullName,
        String email,
        User.Role role
) {}