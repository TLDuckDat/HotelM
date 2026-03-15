package org.example.hotelm.repository;

import org.example.hotelm.model.Booking;
import org.example.hotelm.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

// extends JpaRepository để không phải tự viết Query chay
@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    boolean existsOverlappingBooking(Room room, List<Booking.BookingStatus> statuses,
            LocalDateTime checkIn, LocalDateTime checkOut);

    // Lấy danh sách phòng đã được đặt trong khoảng thời gian [start, end]
    @Query("""
            SELECT DISTINCT b.room
            FROM Booking b
            WHERE b.checkIn < :end
              AND b.checkOut > :start
              AND b.status IN :statuses
            """)
    List<Room> findBookedRoomsBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("statuses") List<Booking.BookingStatus> statuses);
}
