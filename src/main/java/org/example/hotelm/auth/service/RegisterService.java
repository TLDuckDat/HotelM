package org.example.hotelm.auth.service;

import org.example.hotelm.auth.dto.AuthResponse;
import org.example.hotelm.auth.dto.RegisterRequest;

public interface RegisterService {
    AuthResponse register(RegisterRequest request);
}
