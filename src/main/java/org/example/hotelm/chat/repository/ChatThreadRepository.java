package org.example.hotelm.chat.repository;

import org.example.hotelm.chat.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatThreadRepository extends JpaRepository<ChatThread, String> {
    List<ChatThread> findByGuest_UserIDOrStaff_UserID(String guestUserId, String staffUserId);
}
