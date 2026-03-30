package org.example.hotelm.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.hotelm.user.entity.User;

public record CreateThreadRequest(
        @NotBlank(message = "Guest user ID is required")
        String guestUserId,

        @NotBlank(message = "Staff user ID is required")
        String staffUserId
) {}