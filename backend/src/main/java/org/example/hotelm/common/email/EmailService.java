package org.example.hotelm.common.email;

public interface EmailService {
    void sendOtp(String toEmail, String otp);
}