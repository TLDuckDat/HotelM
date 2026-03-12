package org.example.hotelm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String roomID;

    private String roomName;

    @ManyToOne
    private RoomType roomType;

    private int maxCapacity;

    @Enumerated(EnumType.STRING)
    private RoomStatus status;

    private String description;
    private String imageUrl;

    public enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE
    }
}
