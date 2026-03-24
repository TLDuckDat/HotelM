package org.example.hotelm.chat.dto;

import lombok.Builder;
import lombok.Value;
import org.example.hotelm.model.User;

import java.time.Instant;

@Value
@Builder
public class ChatSocketMessage {

    String id;
    String content;
    String senderUserId;
    String senderEmail;
    User.Role senderRole;
    String senderDisplayName;
    String threadGuestUserId;
    String threadGuestEmail;
    Instant sentAt;
}
