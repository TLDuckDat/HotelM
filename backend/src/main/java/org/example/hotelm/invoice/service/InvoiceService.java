package org.example.hotelm.invoice.service;

import org.example.hotelm.invoice.dto.InvoiceCreateRequest;
import org.example.hotelm.invoice.dto.InvoiceResponse;

import java.util.List;

public interface InvoiceService {
    List<InvoiceResponse> getAllInvoices();
    InvoiceResponse getInvoiceById(String id);
    InvoiceResponse getInvoiceByBookingId(String bookingId);
    List<InvoiceResponse> getInvoicesByUserId(String userId);
    InvoiceResponse createInvoice(InvoiceCreateRequest request);
    InvoiceResponse updateInvoiceStatus(String id, org.example.hotelm.invoice.entity.Invoice.PaymentStatus status);
    void deleteInvoice(String id);
}