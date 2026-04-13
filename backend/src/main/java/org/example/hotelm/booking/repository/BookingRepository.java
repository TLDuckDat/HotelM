package org.example.hotelm.booking.repository;

import org.example.hotelm.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {

    List<Booking> findByUser_UserID(String userId);

}
