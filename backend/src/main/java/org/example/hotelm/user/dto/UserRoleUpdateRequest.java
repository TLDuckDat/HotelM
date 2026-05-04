package org.example.hotelm.user.dto;

import jakarta.validation.constraints.NotNull;
import org.example.hotelm.user.entity.User;

public record UserRoleUpdateRequest(
        @NotNull(message = "Role is required")
        User.Role role
) {}