package org.example.hotelm.auth.service;

import org.example.hotelm.auth.dto.AuthResponse;
import org.example.hotelm.auth.dto.LoginRequest;
import org.example.hotelm.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}

