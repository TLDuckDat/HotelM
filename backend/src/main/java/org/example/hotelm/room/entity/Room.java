package org.example.hotelm.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hotelm.branch.entity.Branch;

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

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    public enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE
    }

}
