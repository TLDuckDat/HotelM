package org.example.hotelm.invoice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.hotelm.booking.entity.Booking;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class Invoice {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String invoiceID;

    @OneToOne
    private Booking booking;

    private double amount;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private LocalDate paidAt;
    private Double discount;
    public enum PaymentMethod{
        CASH,
        CARD,
        TRANSFER
    }
}
