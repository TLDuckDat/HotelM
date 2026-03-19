package org.example.hotelm.controller;

import org.example.hotelm.model.Booking;
import org.example.hotelm.model.Room;
import org.example.hotelm.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String id) {
        return bookingService.getBookingById(id)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy Booking với ID: " + id));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody CreateBookingRequest request) {
        Booking created = bookingService.createBooking(
                request.getUserId(),
                request.getRoomId(),
                request.getCheckIn(),
                request.getCheckOut(),
                request.getNote());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Booking> updateStatus(@PathVariable String id,
            @RequestParam Booking.BookingStatus status) {
        Booking updated = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable String id) {
        Booking cancelled = bookingService.updateBookingStatus(id, Booking.BookingStatus.CANCELLED);
        return ResponseEntity.ok(cancelled);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
    // Lấy danh sách phòng đã được đặt trong khoảng thời gian [start, end]
    @GetMapping("/rooms/booked")
    public ResponseEntity<List<Room>> getBookedRooms(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<Room> rooms = bookingService.getBookedRoomsBetween(start, end);
        return ResponseEntity.ok(rooms);
    }

    // Tạo 1 lớp request riêng cho @RequestBody
    public static class CreateBookingRequest {
        private String userId;
        private String roomId;
        private LocalDateTime checkIn;
        private LocalDateTime checkOut;
        private String note;

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getRoomId() {
            return roomId;
        }

        public void setRoomId(String roomId) {
            this.roomId = roomId;
        }

        public LocalDateTime getCheckIn() {
            return checkIn;
        }

        public void setCheckIn(LocalDateTime checkIn) {
            this.checkIn = checkIn;
        }

        public LocalDateTime getCheckOut() {
            return checkOut;
        }

        public void setCheckOut(LocalDateTime checkOut) {
            this.checkOut = checkOut;
        }

        public String getNote() {
            return note;
        }

        public void setNote(String note) {
            this.note = note;
        }
    }
}