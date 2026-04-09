package org.example.hotelm.booking.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.repository.BookingRepository;
import org.example.hotelm.booking.service.BookingService;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
    }

    @Override
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUser_UserID(userId);
    }

    @Override
    public Booking createBooking(Booking booking) {
        booking.setBookingID(null);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking updateBookingStatus(String bookingId, Booking.BookingStatus status) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    @Override
    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Booking not found with ID: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }
}
