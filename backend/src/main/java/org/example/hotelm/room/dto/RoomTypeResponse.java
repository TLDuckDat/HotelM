package org.example.hotelm.room.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomTypeResponse {

    private String typeId;
    private String typeName;
    private Double basePrice;
    private String description;

}