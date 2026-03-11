package org.example.hotelm.model;

import java.time.LocalDateTime;

public class Booking {
    public enum BookingStatus {
        PENDING,
        CONFIRMED,
        CHECKED_IN,
        CHECKED_OUT,
        CANCELLED
    }
    private String bookingID;
    private User user;
    private Room room;
    private LocalDateTime checkIn;
    private LocalDateTime checkOut;
    private double totalPrice;
    private BookingStatus status;
    private LocalDateTime createdAt;
    private String note;
}
