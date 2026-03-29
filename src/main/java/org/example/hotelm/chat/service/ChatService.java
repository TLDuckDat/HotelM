package org.example.hotelm.chat.service;

import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.entity.ChatThread;
import org.example.hotelm.chat.entity.ChatMessage;

import java.util.List;

public interface ChatService {
    List<ChatThread> getThreadsByUserId(String userId);
    ChatThread getThreadById(String threadId);
    ChatMessage sendMessage(ChatMessageRequest request);
}
