package org.example.hotelm.room.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;
import org.example.hotelm.room.entity.Room;

@Data
public class RoomUpdateRequest {

    private String roomName;
    private String roomTypeId;

    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;

    private String description;
    private String imageUrl;
    private Room.RoomStatus status;

}