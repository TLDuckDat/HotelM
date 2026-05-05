package org.example.hotelm.invoice.repository;

import org.example.hotelm.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByBooking_BookingID(String bookingId);
    List<Invoice> findByBooking_User_UserID(String userId);

    @Query("SELECT SUM(i.amount - COALESCE(i.discount, 0)) FROM Invoice i " +
           "WHERE i.booking.room.branch.branchId = :branchId " +
           "AND i.paidAt IS NOT NULL " +
           "AND YEAR(i.paidAt) = :year " +
           "AND MONTH(i.paidAt) = :month")
    Double sumRevenueByBranchAndMonth(@Param("branchId") String branchId, @Param("year") int year, @Param("month") int month);

    @Query("SELECT SUM(i.amount - COALESCE(i.discount, 0)) FROM Invoice i " +
           "WHERE i.paidAt IS NOT NULL " +
           "AND YEAR(i.paidAt) = :year " +
           "AND MONTH(i.paidAt) = :month")
    Double sumGlobalRevenueByMonth(@Param("year") int year, @Param("month") int month);
}