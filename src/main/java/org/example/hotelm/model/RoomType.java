package org.example.hotelm.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomType {
    private String typeID;
    private String typeName;
    private Double basePrice;
    private String description;
}
