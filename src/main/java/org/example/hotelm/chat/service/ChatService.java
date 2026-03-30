package org.example.hotelm.chat.service;

import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.dto.CreateThreadRequest;
import org.example.hotelm.chat.entity.ChatMessage;
import org.example.hotelm.chat.entity.ChatThread;
import org.example.hotelm.user.entity.User;

import java.util.List;

public interface ChatService {

    /**
     * Lấy tất cả thread của một user (dù là guest hay staff).
     */
    List<ChatThread> getThreadsByUserId(String userId);

    /**
     * Lấy thread theo ID.
     */
    ChatThread getThreadById(String threadId);

    /**
     * Guest tạo thread mới để chat với một nhân viên (ADMIN / RECEPTIONIST).
     * Nếu đã tồn tại thread giữa cặp (guest, staff) thì trả về thread cũ.
     */
    ChatThread createThread(CreateThreadRequest request);

    /**
     * Gửi tin nhắn vào thread.
     */
    ChatMessage sendMessage(ChatMessageRequest request);

    /**
     * Lấy danh sách nhân viên (ADMIN + RECEPTIONIST) đang hoạt động
     * để guest lựa chọn người muốn liên hệ.
     */
    List<User> getAvailableStaff();
}