package org.example.hotelm.booking.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.user.entity.User;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String bookingID;

    @ManyToOne
    private User user;

    @ManyToOne
    private Room room;

    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private double totalPrice;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime createdAt;
    private String note;

    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CHECKED_IN,
        CHECKED_OUT,
        CANCELLED
    }

}

