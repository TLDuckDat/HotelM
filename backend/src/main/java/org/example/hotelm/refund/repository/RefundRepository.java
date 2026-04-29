package org.example.hotelm.refund.repository;

import org.example.hotelm.refund.entity.RefundRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface RefundRepository extends JpaRepository<RefundRequest, String> {
    List<RefundRequest> findAllByOrderByCreatedAtDesc();

    boolean existsByBooking_BookingIDAndStatusIn(String bookingId, Collection<RefundRequest.RefundStatus> statuses);
}

