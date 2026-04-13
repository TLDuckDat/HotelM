package org.example.hotelm.room.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomTypeCreateRequest {

    @NotBlank(message = "Type name is required")
    private String typeName;

    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", message = "Base price must be >= 0")
    private Double basePrice;

    private String description;

}