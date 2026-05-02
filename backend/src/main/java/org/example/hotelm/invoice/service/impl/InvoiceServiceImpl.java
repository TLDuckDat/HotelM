package org.example.hotelm.invoice.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.booking.entity.Booking;
import org.example.hotelm.booking.repository.BookingRepository;
import org.example.hotelm.common.exception.ConflictException;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.invoice.dto.InvoiceCreateRequest;
import org.example.hotelm.invoice.dto.InvoiceResponse;
import org.example.hotelm.invoice.entity.Invoice;
import org.example.hotelm.invoice.mapper.InvoiceMapper;
import org.example.hotelm.invoice.repository.InvoiceRepository;
import org.example.hotelm.invoice.service.InvoiceService;
import org.example.hotelm.room.entity.Room;
import org.example.hotelm.room.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BookingRepository bookingRepository;
    private final InvoiceMapper invoiceMapper;
    private final RoomRepository roomRepository;

    @Override
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll()
                .stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    @Override
    public InvoiceResponse getInvoiceById(String id) {
        return invoiceMapper.toResponse(findOrThrow(id));
    }

    @Override
    public InvoiceResponse getInvoiceByBookingId(String bookingId) {
        Invoice invoice = invoiceRepository.findByBooking_BookingID(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy invoice cho booking: " + bookingId));
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    public List<InvoiceResponse> getInvoicesByUserId(String userId) {
        return invoiceRepository.findByBooking_User_UserID(userId)
                .stream()
                .map(invoiceMapper::toResponse)
                .toList();
    }

    @Override
    public InvoiceResponse createInvoice(InvoiceCreateRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy booking: " + request.bookingId()));

        invoiceRepository.findByBooking_BookingID(request.bookingId())
                .ifPresent(i -> {
                    throw new ConflictException("Invoice đã tồn tại cho booking: " + request.bookingId());
                });

        Invoice invoice = new Invoice();
        invoice.setBooking(booking);
        invoice.setAmount(booking.getTotalPrice());
        invoice.setDiscount(request.discount());
        invoice.setPaymentMethod(request.paymentMethod());
        invoice.setStatus(Invoice.PaymentStatus.PENDING);
        invoice.setPaidAt(null);

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    public InvoiceResponse updateInvoiceStatus(String id, Invoice.PaymentStatus status) {
        Invoice invoice = findOrThrow(id);
        invoice.setStatus(status);

        if (status == Invoice.PaymentStatus.COMPLETED) {
            invoice.setPaidAt(LocalDate.now());
            Booking booking = invoice.getBooking();
            if (booking != null) {
                if (booking.getStatus() == Booking.BookingStatus.PENDING) {
                    booking.setStatus(Booking.BookingStatus.CONFIRMED);
                }
                if (booking.getRoom() != null) {
                    Room room = roomRepository.findById(booking.getRoom().getRoomID())
                            .orElse(null);
                    if (room != null) {
                        room.setStatus(Room.RoomStatus.BOOKED);
                        roomRepository.save(room);
                    }
                }
                bookingRepository.save(booking);
            }
        } else if (status == Invoice.PaymentStatus.REJECTED) {

            invoice.setPaidAt(null);
            Booking booking = invoice.getBooking();
            if (booking != null && booking.getRoom() != null) {
                Room room = roomRepository.findById(booking.getRoom().getRoomID())
                        .orElse(null);
                if (room != null && room.getStatus() == Room.RoomStatus.BOOKED) {
                    room.setStatus(Room.RoomStatus.AVAILABLE);
                    roomRepository.save(room);
                }
            }
        } else {
            invoice.setPaidAt(null);
        }

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    public void deleteInvoice(String id) {
        Invoice invoice = findOrThrow(id);
        invoiceRepository.delete(invoice);
    }

    private Invoice findOrThrow(String id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy invoice với ID: " + id));
    }

}