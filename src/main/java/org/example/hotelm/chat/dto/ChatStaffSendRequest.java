package org.example.hotelm.chat.dto;

import lombok.Data;

@Data
public class ChatStaffSendRequest {

    private String recipientEmail;
    private String content;
}
