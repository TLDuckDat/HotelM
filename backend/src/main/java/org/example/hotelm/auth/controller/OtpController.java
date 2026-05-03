package org.example.hotelm.auth.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.auth.dto.RegisterRequest;
import org.example.hotelm.auth.service.AuthService;
import org.example.hotelm.auth.dto.AuthResponse;
import org.example.hotelm.common.email.EmailService;
import org.example.hotelm.common.exception.BadRequestException;
import org.example.hotelm.common.otp.OtpStore;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Map;

@RestController
@RequestMapping("/auth/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpStore otpStore;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final AuthService authService;

    @Value("${otp.expiry-seconds:300}")
    private long otpExpirySeconds;

    // POST /auth/otp/send  { "email": "..." }
    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendOtp(
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required");
        }
        email = email.trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email này đã được sử dụng");
        }

        String otp = String.format("%06d", new SecureRandom().nextInt(1_000_000));
        otpStore.save(email, otp, otpExpirySeconds);
        emailService.sendOtp(email, otp);

        return ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến " + email));
    }

    // POST /auth/otp/verify  { email, otp, fullName, password }
    @PostMapping("/verify")
    public ResponseEntity<AuthResponse> verifyAndRegister(
            @RequestBody OtpVerifyRequest request) {

        String email = request.email().trim().toLowerCase();

        if (!otpStore.verify(email, request.otp())) {
            throw new BadRequestException("OTP không hợp lệ hoặc đã hết hạn");
        }

        otpStore.remove(email);

        AuthResponse response = authService.register(
                new RegisterRequest(request.fullName(), email, request.password())
        );

        return ResponseEntity.ok(response);
    }

    public record OtpVerifyRequest(
            @NotBlank String email,
            @NotBlank String otp,
            @NotBlank String fullName,
            @NotBlank String password
    ) {}
}