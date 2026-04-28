package org.example.hotelm.invoice.dto;

import jakarta.validation.constraints.NotNull;
import org.example.hotelm.invoice.entity.Invoice;

public record InvoiceStatusUpdateRequest(
        @NotNull(message = "Payment status is required")
        Invoice.PaymentStatus status
) {}
