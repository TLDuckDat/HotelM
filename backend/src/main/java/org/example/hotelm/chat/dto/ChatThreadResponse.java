package org.example.hotelm.chat.dto;

import java.time.Instant;
import java.util.List;

public record ChatThreadResponse(
        String id,
        String guestUserId,
        String staffUserId,
        Instant createdAt,
        Instant lastMessageAt,
        List<ChatMessageResponse> messages
) {}

