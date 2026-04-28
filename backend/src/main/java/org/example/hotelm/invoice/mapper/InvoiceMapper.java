package org.example.hotelm.invoice.mapper;

import org.example.hotelm.invoice.dto.InvoiceResponse;
import org.example.hotelm.invoice.entity.Invoice;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(Invoice invoice) {
        double discount = invoice.getDiscount() != null ? invoice.getDiscount() : 0.0;
        double finalAmount = invoice.getAmount() - discount;

        return new InvoiceResponse(
                invoice.getInvoiceID(),
                invoice.getBooking() == null ? null : invoice.getBooking().getBookingID(),
                invoice.getBooking() == null ? null : invoice.getBooking().getUser().getUserID(),
                invoice.getBooking() == null ? null : invoice.getBooking().getRoom().getRoomID(),
                invoice.getAmount(),
                invoice.getDiscount(),
                finalAmount,
                invoice.getPaymentMethod(),
                invoice.getStatus(),
                invoice.getPaidAt()
        );
    }
}