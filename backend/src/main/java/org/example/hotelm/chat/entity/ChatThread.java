package org.example.hotelm.chat.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.example.hotelm.user.entity.User;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class ChatThread {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_user_id", nullable = false)
    private User guest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id")
    private User staff;

    private Instant createdAt;
    private Instant lastMessageAt;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatMessage> messages = new ArrayList<>();
}
