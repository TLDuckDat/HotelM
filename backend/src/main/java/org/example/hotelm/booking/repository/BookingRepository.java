package org.example.hotelm.booking.repository;

import org.springframework.data.repository.query.Param;
import org.example.hotelm.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUser_UserID(String userId);


    @Query("""
            SELECT b FROM Booking b
            WHERE b.room.roomID = :roomId
              AND b.status NOT IN (
                  org.example.hotelm.booking.entity.Booking.BookingStatus.CANCELLED,
                  org.example.hotelm.booking.entity.Booking.BookingStatus.CHECKED_OUT
              )
              AND b.checkIn  < :checkOut
              AND b.checkOut > :checkIn
            """)
    List<Booking> findOverlapping(
            @Param("roomId")   String roomId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );
}
