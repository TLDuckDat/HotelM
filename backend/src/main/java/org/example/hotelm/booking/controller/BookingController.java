package org.example.hotelm.booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.dto.BookingCreateRequest;
import org.example.hotelm.booking.dto.BookingResponse;
import org.example.hotelm.booking.dto.BookingStatusUpdateRequest;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.mapper.BookingMapper;
import org.example.hotelm.booking.service.BookingService;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        List<BookingResponse> data = bookingService.getAllBookings().stream()
                .map(bookingMapper::toResponse)
                .toList();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        return ResponseEntity.ok(bookingMapper.toResponse(bookingService.getBookingById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByUserId(@PathVariable String userId) {
        List<BookingResponse> data = bookingService.getBookingsByUserId(userId).stream()
                .map(bookingMapper::toResponse)
                .toList();
        return ResponseEntity.ok(data);
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingCreateRequest request) {
        User user = new User();
        user.setUserID(request.userId());
        Room room = new Room(); 
        room.setRoomID(request.roomId());
        Booking created = bookingService.createBooking(bookingMapper.toEntity(request, user, room));
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingMapper.toResponse(created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest request
    ) {
        Booking updated = bookingService.updateBookingStatus(id, request.status());
        return ResponseEntity.ok(bookingMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }

}
