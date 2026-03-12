package org.example.hotelm.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String reviewID;

    @ManyToOne
    private User user;

    @ManyToOne
    private Room room;

    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
