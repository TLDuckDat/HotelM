package org.example.hotelm.chat.repository;

import org.example.hotelm.chat.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByThread_IdOrderBySentAtAsc(String threadId);
}
