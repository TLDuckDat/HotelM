package org.example.hotelm.notification.service;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.notification.entity.Notification;
import org.example.hotelm.notification.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public List<Notification> getNotificationsForUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void createAndPush(String userId, String title, String message, Notification.NotificationType type, String relatedId) {
        Notification notification = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .relatedId(relatedId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push real-time via WebSocket
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, saved);
    }

    private final org.example.hotelm.user.repository.UserRepository userRepository;

    @Transactional
    public void notifyAdmins(String title, String message, Notification.NotificationType type, String relatedId) {
        userRepository.findByRoleInAndStatus(
                List.of(org.example.hotelm.user.entity.User.Role.ADMIN, org.example.hotelm.user.entity.User.Role.RECEPTIONIST),
                org.example.hotelm.user.entity.User.UserStatus.ACTIVE
        ).forEach(staff -> createAndPush(staff.getUserID(), title, message, type, relatedId));
    }


    @Transactional
    public void markAsRead(String notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().filter(n -> !n.isRead()).toList();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void markAsReadByRelatedId(String userId, String relatedId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndRelatedId(userId, relatedId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}

