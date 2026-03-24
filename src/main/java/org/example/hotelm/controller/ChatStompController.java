package org.example.hotelm.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.ChatPrincipal;
import org.example.hotelm.chat.dto.ChatGuestSendRequest;
import org.example.hotelm.chat.dto.ChatStaffSendRequest;
import org.example.hotelm.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatService chatService;

    @MessageMapping("/chat/guest")
    public void guestMessage(@Payload ChatGuestSendRequest body, SimpMessageHeaderAccessor headerAccessor) {
        ChatPrincipal.fromSessionAttributes(headerAccessor.getSessionAttributes())
                .ifPresent(p -> chatService.handleGuestMessage(p, body != null ? body.getContent() : null));
    }

    @MessageMapping("/chat/staff")
    public void staffMessage(@Payload ChatStaffSendRequest body, SimpMessageHeaderAccessor headerAccessor) {
        if (body == null) {
            return;
        }
        ChatPrincipal.fromSessionAttributes(headerAccessor.getSessionAttributes())
                .ifPresent(p -> chatService.handleStaffMessage(p, body.getRecipientEmail(), body.getContent()));
    }
}
