package org.example.hotelm.auth.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.auth.dto.AuthResponse;
import org.example.hotelm.auth.dto.RegisterRequest;
import org.example.hotelm.auth.service.RegisterService;
import org.example.hotelm.common.exception.ConflictException;
import org.example.hotelm.common.security.JwtService;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RegisterServiceImpl implements RegisterService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email '" + request.email() + "' đã được sử dụng");
        }

        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(User.Role.USER);
        user.setStatus(User.UserStatus.ACTIVE);
        user.setCreatedAt(LocalDate.now());

        userRepository.save(user);

        String token = jwtService.generateToken(
                userDetailsService.loadUserByUsername(user.getEmail())
        );

        return new AuthResponse(token, "Bearer", user.getUserID(), user.getEmail());
    }
}