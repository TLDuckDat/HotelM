package org.example.hotelm.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomCreateRequest {

    @NotBlank(message = "Room name is required")
    private String roomName;

    @NotBlank(message = "Room type ID is required")
    private String roomTypeId;

    @Min(value = 1, message = "Max capacity must be at least 1")
    private int maxCapacity;

    private String description;
    private String imageUrl;
}