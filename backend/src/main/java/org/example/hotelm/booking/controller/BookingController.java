package org.example.hotelm.booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.dto.BookingCreateRequest;
import org.example.hotelm.booking.dto.BookingQueueResult;
import org.example.hotelm.booking.dto.BookingResponse;
import org.example.hotelm.booking.dto.BookingStatusUpdateRequest;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.mapper.BookingMapper;
import org.example.hotelm.booking.service.BookingQueueService;
import org.example.hotelm.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;
    private final BookingQueueService bookingQueueService;

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

    /**
     * Tạo booking qua queue để tránh double-booking.
     * Trả về 202 Accepted + requestId để client polling.
     * <p>
     * Flow:
     * POST /bookings       → 202 { requestId: "..." }
     * GET  /bookings/queue/{requestId} → { status: PENDING | SUCCESS | FAILED, data: ... }
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {
        String requestId = bookingQueueService.enqueue(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of(
                        "requestId", requestId,
                        "message", "Yêu cầu đặt phòng đang được xử lý. Dùng requestId để kiểm tra kết quả."
                ));
    }

    /**
     * Polling endpoint: client gọi mỗi 1-2 giây để lấy kết quả.
     * Khi status = SUCCESS hoặc FAILED thì dừng polling.
     */
    @GetMapping("/queue/{requestId}")
    public ResponseEntity<BookingQueueResult> getBookingQueueResult(
            @PathVariable String requestId) {
        BookingQueueResult result = bookingQueueService.getResult(requestId);
        return switch (result.status()) {
            case PENDING -> ResponseEntity.accepted().body(result);
            case SUCCESS -> ResponseEntity.ok(result);
            case FAILED -> ResponseEntity.unprocessableEntity().body(result);
            case NOT_FOUND -> ResponseEntity.notFound().build();
        };
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable String id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        Booking updated = bookingService.updateBookingStatus(id, request.status());
        return ResponseEntity.ok(bookingMapper.toResponse(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable String id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}