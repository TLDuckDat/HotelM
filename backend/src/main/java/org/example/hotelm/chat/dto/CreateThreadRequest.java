package org.example.hotelm.chat.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateThreadRequest(
        @NotBlank(message = "Guest user ID is required")
        String guestUserId,

        @NotBlank(message = "Staff user ID is required")
        String staffUserId
) {}