package org.example.hotelm.chat.controller;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.dto.ChatMessageResponse;
import org.example.hotelm.chat.mapper.ChatMapper;
import org.example.hotelm.chat.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatStompController {

    private final ChatService chatService;
    private final ChatMapper chatMapper;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client gửi message đến: /app/chat.send/{threadId}
     * Server broadcast đến topic riêng của thread:
     * /topic/chat.thread.{threadId}
     * Nhờ vậy nên những người subscribe đúng thread mới nhận được tin,
     */
    @MessageMapping("/chat.send/{threadId}")
    public void send(
            @DestinationVariable String threadId,
            @Payload ChatMessageRequest request
    ) {
        ChatMessageResponse response = chatMapper.toMessageResponse(chatService.sendMessage(request));
        messagingTemplate.convertAndSend("/topic/chat.thread." + threadId, response);
    }
}