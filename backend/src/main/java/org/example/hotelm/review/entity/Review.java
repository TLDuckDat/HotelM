package org.example.hotelm.review.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.user.entity.User;

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
