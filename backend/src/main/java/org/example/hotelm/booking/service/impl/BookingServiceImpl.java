package org.example.hotelm.booking.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.repository.BookingRepository;
import org.example.hotelm.booking.service.BookingService;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.room.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final org.example.hotelm.user.repository.UserRepository userRepository;
    private final org.example.hotelm.notification.service.NotificationService notificationService;

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

        if (booking.getRoom() != null && booking.getRoom().getRoomID() != null) {
            if (hasOverlappingBooking(booking.getRoom().getRoomID(), booking.getCheckIn(), booking.getCheckOut())) {
                throw new org.example.hotelm.common.exception.ConflictException("Phòng đã được đặt trong khoảng thời gian này!");
            }
        }

        // Tự động tính totalPrice = basePrice * số đêm
        if (booking.getRoom() != null && booking.getRoom().getRoomID() != null) {
            roomRepository.findById(booking.getRoom().getRoomID()).ifPresent(room -> {
                if (room.getRoomType() != null && room.getRoomType().getBasePrice() != null) {
                    long nights = java.time.temporal.ChronoUnit.DAYS.between(
                            booking.getCheckIn().toLocalDate(),
                            booking.getCheckOut().toLocalDate());
                    booking.setTotalPrice(room.getRoomType().getBasePrice() * Math.max(nights, 1));
                }
            });
        }

        Booking saved = bookingRepository.save(booking);

        // Notify admins/receptionists
        userRepository.findByRoleInAndStatus(
                List.of(org.example.hotelm.user.entity.User.Role.ADMIN, org.example.hotelm.user.entity.User.Role.RECEPTIONIST),
                org.example.hotelm.user.entity.User.UserStatus.ACTIVE
        ).forEach(staff -> {
            notificationService.createAndPush(
                    staff.getUserID(),
                    "New Booking",
                    "A new booking has been created for room " + (saved.getRoom() != null ? saved.getRoom().getRoomName() : "N/A"),
                    org.example.hotelm.notification.entity.Notification.NotificationType.BOOKING_NEW,
                    saved.getBookingID()
            );
        });

        return saved;
    }

    @Override
    public Booking updateBookingStatus(String bookingId, Booking.BookingStatus status) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);

        // Notify user about status update
        if (saved.getUser() != null) {
            notificationService.createAndPush(
                    saved.getUser().getUserID(),
                    "Booking Updated",
                    "Your booking for room " + (saved.getRoom() != null ? saved.getRoom().getRoomName() : "N/A") + " is now " + status,
                    org.example.hotelm.notification.entity.Notification.NotificationType.BOOKING_STATUS,
                    saved.getBookingID()
            );
        }

        return saved;
    }

    @Override
    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException("Booking not found with ID: " + bookingId);
        }
        bookingRepository.deleteById(bookingId);
    }

    @Override
    public boolean hasOverlappingBooking(String roomId, LocalDateTime checkIn, LocalDateTime checkOut) {
        return !bookingRepository.findOverlapping(roomId, checkIn, checkOut).isEmpty();
    }

}
