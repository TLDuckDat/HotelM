package org.example.hotelm.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.example.hotelm.invoice.entity.Invoice;

public record InvoiceCreateRequest(
        @NotBlank(message = "Booking ID is required")
        String bookingId,

        @NotNull(message = "Payment method is required")
        Invoice.PaymentMethod paymentMethod,

        Double discount
) {}