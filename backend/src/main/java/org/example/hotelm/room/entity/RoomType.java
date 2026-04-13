package org.example.hotelm.room.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
