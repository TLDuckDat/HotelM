package org.example.hotelm.chat.dto;

import org.example.hotelm.user.entity.User;

import java.time.Instant;

public record ChatMessageResponse(
        String id,
        String threadId,
        String senderUserId,
        User.Role senderRole,
        String content,
        Instant sentAt
) {}

