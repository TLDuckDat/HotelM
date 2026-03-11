package org.example.hotelm.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    public enum RoomStatus {
        AVAILABLE,
        BOOKED,
        MAINTENANCE
    }
    private String roomID;
    private String roomName;
    private RoomType roomType;
    private int maxCapacity;
    private RoomStatus status;
    private String description;
    private String imageUrl;
}
