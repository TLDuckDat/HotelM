package org.example.hotelm.chat.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.dto.ChatMessageResponse;
import org.example.hotelm.chat.mapper.ChatMapper;
import org.example.hotelm.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;

    @MessageMapping("/chat.send")
    @SendTo("/topic/chat.messages")
    public ChatMessageResponse send(@Payload ChatMessageRequest request) {
        return chatMapper.toMessageResponse(chatService.sendMessage(request));
    }
}
