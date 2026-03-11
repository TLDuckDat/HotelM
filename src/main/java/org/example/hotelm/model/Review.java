package org.example.hotelm.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    private String reviewID;
    private User user;
    private Room room;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
