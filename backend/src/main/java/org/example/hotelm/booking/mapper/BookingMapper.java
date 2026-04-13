package org.example.hotelm.booking.mapper;

import org.example.hotelm.booking.dto.BookingCreateRequest;
import org.example.hotelm.booking.dto.BookingResponse;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.user.entity.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class BookingMapper {

    public Booking toEntity(BookingCreateRequest request, User user, Room room) {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setRoom(room);
        booking.setCheckIn(request.checkIn());
        booking.setCheckOut(request.checkOut());
        booking.setNote(request.note());
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setTotalPrice(0.0d);
        return booking;
    }

    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
                booking.getBookingID(),
                booking.getUser() == null ? null : booking.getUser().getUserID(),
                booking.getRoom() == null ? null : booking.getRoom().getRoomID(),
                booking.getCheckIn(),
                booking.getCheckOut(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getCreatedAt(),
                booking.getNote()
        );
    }
}
