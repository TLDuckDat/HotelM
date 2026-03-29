package org.example.hotelm.invoice.repository;

import org.example.hotelm.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByBooking_BookingID(String bookingId);
    List<Invoice> findByBooking_User_UserID(String userId);
}