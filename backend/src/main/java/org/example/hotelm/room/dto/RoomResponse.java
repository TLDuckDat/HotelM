package org.example.hotelm.room.dto;

import lombok.Builder;
import lombok.Data;
import org.example.hotelm.room.entity.Room;

@Data
@Builder
public class RoomResponse {

    private String roomId;
    private String roomName;
    private int maxCapacity;
    private Room.RoomStatus status;
    private String description;
    private String imageUrl;

    private String roomTypeId;
    private String roomTypeName;
    private Double basePrice;
}