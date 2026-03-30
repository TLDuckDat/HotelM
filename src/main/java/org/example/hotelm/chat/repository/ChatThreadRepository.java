package org.example.hotelm.chat.repository;

import org.example.hotelm.chat.entity.ChatThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatThreadRepository extends JpaRepository<ChatThread, String> {

    /**
     * Tìm tất cả thread của một user (dù là guest hay staff).
     * */
    List<ChatThread> findByGuest_UserIDOrStaff_UserID(String guestUserId, String staffUserId);

    /**
     * Tìm thread theo cặp (guest, staff) để tránh tạo trùng.
     */
    Optional<ChatThread> findByGuest_UserIDAndStaff_UserID(String guestUserId, String staffUserId);
}