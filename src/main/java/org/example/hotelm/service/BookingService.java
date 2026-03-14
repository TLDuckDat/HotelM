package org.example.hotelm.service;

import org.example.hotelm.model.Booking;
import org.example.hotelm.model.Room;
import org.example.hotelm.model.User;
import org.example.hotelm.repository.BookingRepository;
import org.example.hotelm.repository.RoomRepository;
import org.example.hotelm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoomRepository roomRepository;

    // lấy toàn bộ danh sách Booking
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // lấy Booking từ ID
    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    // Tạo mới Booking
    public Booking createBooking(String userId, String roomId,
                                 LocalDateTime checkIn, LocalDateTime checkOut,
                                 String note) {
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new RuntimeException("Thời gian nhận/trả phòng không hợp lệ");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));
        Room room = roomRepository.findById(Long.valueOf(roomId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng với ID: " + roomId));

        // Kiểm tra phòng đã được đặt chưa
        List<Booking.BookingStatus> activeStatuses = Arrays.asList(
                Booking.BookingStatus.PENDING,
                Booking.BookingStatus.CONFIRMED,
                Booking.BookingStatus.CHECKED_IN
        );
        // Kiểm tra trùng
        boolean isOverlap = bookingRepository.existsOverlappingBooking(room, activeStatuses, checkIn, checkOut);
        if (isOverlap) {
            throw new RuntimeException("Phòng đã được đặt trong khoảng thời gian này");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setNote(note);
        // Tính tổng chi phí
        double totalPrice = 0.0;
        if (room.getRoomType() != null && room.getRoomType().getBasePrice() != null) {
            LocalDate startDate = checkIn.toLocalDate();
            LocalDate endDate = checkOut.toLocalDate();
            long nights = ChronoUnit.DAYS.between(startDate, endDate);
            if (nights <= 0) {
                nights = 1;
            }
            totalPrice = nights * room.getRoomType().getBasePrice();
        }
        booking.setTotalPrice(totalPrice);
        return bookingRepository.save(booking);
    }

    // Cập nhật trạng thái của Booking
    public Booking updateBookingStatus(String id, Booking.BookingStatus status) {
        Booking existing = bookingRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy Booking với ID : " + id));
        existing.setStatus(status);
        return bookingRepository.save(existing);
    }

    // Xóa Booking
    public void deleteBooking(String id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy Booking với ID : " + id);
        }
        bookingRepository.deleteById(id);
    }
}
