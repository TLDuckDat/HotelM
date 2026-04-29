package org.example.hotelm.refund.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.user.entity.User;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "refund_requests")
public class RefundRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String refundId;

    @ManyToOne(optional = false)
    private Booking booking;

    @ManyToOne(optional = false)
    private User user;

    @Column(length = 1000)
    private String reason;

    @Enumerated(EnumType.STRING)
    private RefundStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public enum RefundStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}

