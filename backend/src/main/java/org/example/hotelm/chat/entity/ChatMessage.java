package org.example.hotelm.chat.entity;

import jakarta.persistence.*;
import lombok.*;
import org.example.hotelm.user.entity.User;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private ChatThread thread;

    @Column(nullable = false, length = 36)
    private String senderUserId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private User.Role senderRole;

    @Column(nullable = false, length = 4000)
    private String content;

    private Instant sentAt;
}
