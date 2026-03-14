package org.example.hotelm.repository;

import org.example.hotelm.model.Booking;
import org.example.hotelm.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

// extends JpaRepository để không phải tự viết Query chay
@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    boolean existsOverlappingBooking(Room room, List<Booking.BookingStatus> statuses, LocalDateTime checkIn, LocalDateTime checkOut);
}
