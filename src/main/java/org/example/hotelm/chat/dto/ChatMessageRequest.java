package org.example.hotelm.chat.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.hotelm.user.entity.User;

public record ChatMessageRequest(
        @NotBlank(message = "Thread ID is required")
        String threadId,
        @NotBlank(message = "Sender user ID is required")
        String senderUserId,
        @NotNull(message = "Sender role is required")
        User.Role senderRole,
        @NotBlank(message = "Content is required")
        String content
) {}

