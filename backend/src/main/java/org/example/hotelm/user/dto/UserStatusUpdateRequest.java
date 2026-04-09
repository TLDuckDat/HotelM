package org.example.hotelm.user.dto;

import jakarta.validation.constraints.NotNull;
import org.example.hotelm.user.entity.User;

public record UserStatusUpdateRequest(
        @NotNull(message = "Status is required")
        User.UserStatus status
) {
}
