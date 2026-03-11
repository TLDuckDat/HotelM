package org.example.hotelm.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

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
