package org.example.hotelm.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
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
