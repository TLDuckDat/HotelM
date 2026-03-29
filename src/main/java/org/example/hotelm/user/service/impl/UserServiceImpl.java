package org.example.hotelm.user.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.common.exception.BadRequestException;
import org.example.hotelm.common.exception.ConflictException;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.example.hotelm.user.dto.UserCreateRequest;
import org.example.hotelm.user.dto.UserUpdateRequest;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.repository.UserRepository;
import org.example.hotelm.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));
    }

    @Override
    public User createUser(UserCreateRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email đã tồn tại: " + normalizedEmail);
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phoneNumber());
        user.setEmail(normalizedEmail);
        user.setPassword(request.password());
        user.setCreatedAt(LocalDate.now());
        user.setStatus(request.status() == null ? User.UserStatus.ACTIVE : request.status());
        user.setRole(request.role() == null ? User.Role.USER : request.role());
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new BadRequestException("Password không được để trống");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    @Override
    public User updateUser(String id, UserUpdateRequest request) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + id));

        String normalizedEmail = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCase(normalizedEmail)
                .filter(u -> !u.getUserID().equals(existing.getUserID()))
                .ifPresent(u -> {
                    throw new ConflictException("Email đã tồn tại: " + normalizedEmail);
                });

        existing.setFullName(request.fullName());
        existing.setPhoneNumber(request.phoneNumber());
        existing.setEmail(normalizedEmail);

        if (request.password() != null && !request.password().isBlank()) {
            existing.setPassword(passwordEncoder.encode(request.password()));
        }

        if (request.role() != null) {
            existing.setRole(request.role());
        }

        if (request.status() != null) {
            existing.setStatus(request.status());
        }

        return userRepository.save(existing);
    }

    @Override
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy user với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public User updateUserStatus(String id, User.UserStatus status) {
        User existing = getUserById(id);
        existing.setStatus(status);
        return userRepository.save(existing);
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
