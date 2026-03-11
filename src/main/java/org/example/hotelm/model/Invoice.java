package org.example.hotelm.model;

import java.time.LocalDate;

public class Invoice {
    public enum PaymentMethod{
        CASH,
        CARD,
        TRANSFER
    }
    private String invoiceID;
    private Booking booking;
    private double amount;
    private PaymentMethod paymentMethod;
    private LocalDate paidAt;
    private Double discount;
}
