package org.example.hotelm.chat.dto;

import java.time.Instant;
import java.util.List;

public record ChatThreadResponse(
        String id,
        String guestUserId,
        String guestName,
        String guestEmail,
        String staffUserId,
        String staffName,
        String staffEmail,
        Instant createdAt,
        Instant lastMessageAt,
        List<ChatMessageResponse> messages
) {}

