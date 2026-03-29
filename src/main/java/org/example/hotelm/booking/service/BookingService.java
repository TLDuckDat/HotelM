package org.example.hotelm.booking.service;

import org.example.hotelm.booking.entity.Booking;

import java.util.List;

public interface BookingService {
    List<Booking> getAllBookings();
    Booking getBookingById(String bookingId);
    List<Booking> getBookingsByUserId(String userId);
    Booking createBooking(Booking booking);
    Booking updateBookingStatus(String bookingId, Booking.BookingStatus status);
    void deleteBooking(String bookingId);
}
