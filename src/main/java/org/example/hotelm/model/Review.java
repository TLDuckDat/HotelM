package org.example.hotelm.model;

import java.time.LocalDateTime;

public class Review {
    private String reviewID;
    private User user;
    private Room room;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}
