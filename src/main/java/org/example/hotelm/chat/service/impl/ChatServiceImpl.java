package org.example.hotelm.chat.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.entity.ChatMessage;
import org.example.hotelm.chat.entity.ChatThread;
import org.example.hotelm.chat.repository.ChatMessageRepository;
import org.example.hotelm.chat.repository.ChatThreadRepository;
import org.example.hotelm.chat.service.ChatService;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatThreadRepository chatThreadRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    public List<ChatThread> getThreadsByUserId(String userId) {
        return chatThreadRepository.findByGuest_UserIDOrStaff_UserID(userId, userId);
    }

    @Override
    public ChatThread getThreadById(String threadId) {
        return chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found with ID: " + threadId));
    }

    @Override
    public ChatMessage sendMessage(ChatMessageRequest request) {
        ChatThread thread = getThreadById(request.threadId());
        ChatMessage message = new ChatMessage();
        message.setThread(thread);
        message.setSenderUserId(request.senderUserId());
        message.setSenderRole(request.senderRole());
        message.setContent(request.content());
        message.setSentAt(Instant.now());
        thread.setLastMessageAt(message.getSentAt());
        chatThreadRepository.save(thread);
        return chatMessageRepository.save(message);
    }
}
