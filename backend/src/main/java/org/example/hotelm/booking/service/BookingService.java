package org.example.hotelm.booking.service;

import org.example.hotelm.booking.entity.Booking;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingService {
    List<Booking> getAllBookings();
    Booking getBookingById(String bookingId);
    List<Booking> getBookingsByUserId(String userId);
    Booking createBooking(Booking booking);
    Booking updateBookingStatus(String bookingId, Booking.BookingStatus status);
    void deleteBooking(String bookingId);

    /**
     * Kiểm tra xem phòng đã có booking chồng lấp với khoảng thời gian [checkIn, checkOut] chưa.
     * Dùng để ngăn double-booking trước khi tạo booking mới.
     */
    boolean hasOverlappingBooking(String roomId, LocalDateTime checkIn, LocalDateTime checkOut);
}
