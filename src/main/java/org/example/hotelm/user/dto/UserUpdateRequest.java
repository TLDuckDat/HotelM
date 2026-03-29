package org.example.hotelm.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.example.hotelm.user.entity.User;

public record UserUpdateRequest(
        @NotBlank(message = "Full name is required")
        String fullName,
        String phoneNumber,
        @NotBlank(message = "Email is required")
        @Email(message = "Email format is invalid")
        String email,
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,
        User.Role role,
        User.UserStatus status
) {
}
