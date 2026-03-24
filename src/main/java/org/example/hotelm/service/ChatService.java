package org.example.hotelm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.hotelm.chat.ChatPrincipal;
import org.example.hotelm.chat.dto.ChatSocketMessage;
import org.example.hotelm.model.ChatMessage;
import org.example.hotelm.model.ChatThread;
import org.example.hotelm.model.User;
import org.example.hotelm.repository.ChatMessageRepository;
import org.example.hotelm.repository.ChatThreadRepository;
import org.example.hotelm.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    public static final String TOPIC_USER_PREFIX = "/topic/chat.user.";
    public static final String TOPIC_STAFF = "/topic/chat.staff";

    private final UserRepository userRepository;
    private final ChatThreadRepository chatThreadRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void handleGuestMessage(ChatPrincipal sender, String content) {
        if (sender == null || !StringUtils.hasText(content)) {
            return;
        }
        if (sender.role() != User.Role.USER) {
            log.debug("Ignored guest chat from non-USER role: {}", sender.userId());
            return;
        }
        User guest = userRepository.findById(sender.userId()).orElse(null);
        if (guest == null) {
            return;
        }
        ChatThread thread = getOrCreateThread(guest);
        ChatMessage saved = persistMessage(thread, sender.userId(), sender.role(), content.trim());
        ChatSocketMessage outbound = toSocketMessage(saved, guest.getUserID(), guest.getEmail());
        messagingTemplate.convertAndSend(TOPIC_USER_PREFIX + toTopicKey(guest.getEmail()), outbound);
        messagingTemplate.convertAndSend(TOPIC_STAFF, outbound);
    }

    @Transactional
    public void handleStaffMessage(ChatPrincipal staff, String recipientEmail, String content) {
        if (staff == null || !StringUtils.hasText(content) || !StringUtils.hasText(recipientEmail)) {
            return;
        }
        if (staff.role() != User.Role.ADMIN && staff.role() != User.Role.RECEPTIONIST) {
            log.debug("Ignored staff chat from unauthorized role: {}", staff.userId());
            return;
        }
        User guest = userRepository.findByEmail(recipientEmail.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (guest == null || guest.getRole() != User.Role.USER) {
            log.debug("Staff message rejected: invalid guest recipient {}", recipientEmail);
            return;
        }
        ChatThread thread = getOrCreateThread(guest);
        ChatMessage saved = persistMessage(thread, staff.userId(), staff.role(), content.trim());
        ChatSocketMessage outbound = toSocketMessage(saved, guest.getUserID(), guest.getEmail());
        messagingTemplate.convertAndSend(TOPIC_USER_PREFIX + toTopicKey(guest.getEmail()), outbound);
        messagingTemplate.convertAndSend(TOPIC_STAFF, outbound);
    }

    private ChatThread getOrCreateThread(User guest) {
        return chatThreadRepository.findByGuest(guest)
                .orElseGet(() -> {
                    ChatThread t = new ChatThread();
                    t.setGuest(guest);
                    t.setCreatedAt(Instant.now());
                    return chatThreadRepository.save(t);
                });
    }

    private ChatMessage persistMessage(ChatThread thread, String senderUserId,
                                       User.Role senderRole, String content) {
        ChatMessage msg = new ChatMessage();
        msg.setThread(thread);
        msg.setSenderUserId(senderUserId);
        msg.setSenderRole(senderRole);
        msg.setContent(content);
        msg.setSentAt(Instant.now());
        return chatMessageRepository.save(msg);
    }

    private ChatSocketMessage toSocketMessage(ChatMessage msg, String threadGuestUserId, String threadGuestEmail) {
        User sender = userRepository.findById(msg.getSenderUserId()).orElse(null);
        String senderEmail = sender != null ? sender.getEmail() : "";
        String displayName = sender != null
                ? (sender.getFullName() != null ? sender.getFullName() : sender.getEmail())
                : "Unknown";
        return ChatSocketMessage.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .senderUserId(msg.getSenderUserId())
                .senderEmail(senderEmail)
                .senderRole(msg.getSenderRole())
                .senderDisplayName(displayName)
                .threadGuestUserId(threadGuestUserId)
                .threadGuestEmail(threadGuestEmail)
                .sentAt(msg.getSentAt())
                .build();
    }

    private String toTopicKey(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
