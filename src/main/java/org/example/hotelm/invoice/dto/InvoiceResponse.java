package org.example.hotelm.invoice.dto;

import org.example.hotelm.invoice.entity.Invoice;

import java.time.LocalDate;

public record InvoiceResponse(
        String invoiceId,
        String bookingId,
        String userId,
        String roomId,
        double amount,
        Double discount,
        double finalAmount,
        Invoice.PaymentMethod paymentMethod,
        LocalDate paidAt
) {}