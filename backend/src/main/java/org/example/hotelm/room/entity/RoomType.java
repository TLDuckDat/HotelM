package org.example.hotelm.room.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class RoomType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String typeID;

    private String typeName;
    private Double basePrice;
    private String description;
}
