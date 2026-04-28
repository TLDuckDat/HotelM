package org.example.hotelm.chat.mapper;

import org.example.hotelm.chat.dto.ChatMessageResponse;
import org.example.hotelm.chat.dto.ChatThreadResponse;
import org.example.hotelm.chat.dto.StaffUserResponse;
import org.example.hotelm.chat.entity.ChatMessage;
import org.example.hotelm.chat.entity.ChatThread;
import org.example.hotelm.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ChatMapper {

    public ChatMessageResponse toMessageResponse(ChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getThread() == null ? null : message.getThread().getId(),
                message.getSenderUserId(),
                message.getSenderRole(),
                message.getContent(),
                message.getSentAt()
        );
    }

    public ChatThreadResponse toThreadResponse(ChatThread thread) {
        List<ChatMessageResponse> messages = thread.getMessages() == null
                ? List.of()
                : thread.getMessages().stream().map(this::toMessageResponse).toList();

        return new ChatThreadResponse(
                thread.getId(),
                thread.getGuest() == null ? null : thread.getGuest().getUserID(),
                thread.getGuest() == null ? null : thread.getGuest().getFullName(),
                thread.getGuest() == null ? null : thread.getGuest().getEmail(),
                thread.getStaff() == null ? null : thread.getStaff().getUserID(),
                thread.getStaff() == null ? null : thread.getStaff().getFullName(),
                thread.getStaff() == null ? null : thread.getStaff().getEmail(),
                thread.getCreatedAt(),
                thread.getLastMessageAt(),
                messages
        );
    }

    public StaffUserResponse toStaffUserResponse(User user) {
        return new StaffUserResponse(
                user.getUserID(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}