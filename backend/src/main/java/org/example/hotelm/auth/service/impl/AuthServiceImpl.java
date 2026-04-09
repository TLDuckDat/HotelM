package org.example.hotelm.auth.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.auth.dto.AuthResponse;
import org.example.hotelm.auth.dto.LoginRequest;
import org.example.hotelm.auth.dto.RegisterRequest;
import org.example.hotelm.auth.service.AuthService;
import org.example.hotelm.auth.service.RegisterService;
import org.example.hotelm.common.security.JwtService;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final RegisterService registerService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    public AuthResponse register(RegisterRequest request) {
        return registerService.register(request);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.email() == null ? null : request.email().trim().toLowerCase(Locale.ROOT);
        // Xác thực email + password, tự throw nếu sai
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password())
        );

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow();

        String token = jwtService.generateToken(
                userDetailsService.loadUserByUsername(user.getEmail())
        );

        return new AuthResponse(token, "Bearer", user.getUserID(), user.getEmail());
    }
}