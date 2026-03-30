package org.example.hotelm.chat.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.chat.dto.ChatMessageRequest;
import org.example.hotelm.chat.dto.CreateThreadRequest;
import org.example.hotelm.chat.entity.ChatMessage;
import org.example.hotelm.chat.entity.ChatThread;
import org.example.hotelm.chat.repository.ChatMessageRepository;
import org.example.hotelm.chat.repository.ChatThreadRepository;
import org.example.hotelm.chat.service.ChatService;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatThreadRepository chatThreadRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Override
    public List<ChatThread> getThreadsByUserId(String userId) {
        return chatThreadRepository.findByGuest_UserIDOrStaff_UserID(userId, userId);
    }

    @Override
    public ChatThread getThreadById(String threadId) {
        return chatThreadRepository.findById(threadId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat thread not found: " + threadId));
    }

    /**
     * Tạo thread mới giữa guest và staff được chọn.
     * Nếu đã có thread giữa cặp (guestId, staffId) thì trả về thread cũ
     * thay vì tạo trùng.
     */
    @Override
    @Transactional
    public ChatThread createThread(CreateThreadRequest request) {
        User guest = userRepository.findById(request.guestUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found: " + request.guestUserId()));

        User staff = userRepository.findById(request.staffUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + request.staffUserId()));

        // Validate: staff phải là ADMIN hoặc RECEPTIONIST
        if (staff.getRole() != User.Role.ADMIN && staff.getRole() != User.Role.RECEPTIONIST) {
            throw new IllegalArgumentException("Target user is not a staff member");
        }

        // Tránh tạo thread trùng giữa cùng một cặp (guest, staff)
        return chatThreadRepository
                .findByGuest_UserIDAndStaff_UserID(request.guestUserId(), request.staffUserId())
                .orElseGet(() -> {
                    ChatThread thread = new ChatThread();
                    thread.setGuest(guest);
                    thread.setStaff(staff);
                    thread.setCreatedAt(Instant.now());
                    return chatThreadRepository.save(thread);
                });
    }

    @Override
    @Transactional
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

    /**
     * Trả về danh sách nhân viên đang ACTIVE (ADMIN + RECEPTIONIST)
     * để guest chọn người muốn chat.
     */
    @Override
    public List<User> getAvailableStaff() {
        return userRepository.findByRoleInAndStatus(
                List.of(User.Role.ADMIN, User.Role.RECEPTIONIST),
                User.UserStatus.ACTIVE
        );
    }
}