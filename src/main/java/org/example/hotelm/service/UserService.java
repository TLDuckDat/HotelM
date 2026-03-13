package org.example.hotelm.service;

import org.example.hotelm.model.User;
import org.example.hotelm.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Lấy tất cả user
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Lấy user theo ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Tạo user mới
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + user.getEmail());
        }
        user.setCreatedAt(LocalDate.now());
        if (user.getStatus() == null) {
            user.setStatus(User.UserStatus.ACTIVE);
        }
        if (user.getRole() == null) {
            user.setRole(User.Role.USER);
        }
        return userRepository.save(user);
    }

    // Cập nhật user
    public User updateUser(String id, User updatedUser) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + id));

        existing.setFullName(updatedUser.getFullName());
        existing.setPhoneNumber(updatedUser.getPhoneNumber());
        existing.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(updatedUser.getPassword());
        }

        if (updatedUser.getRole() != null) {
            existing.setRole(updatedUser.getRole());
        }

        if (updatedUser.getStatus() != null) {
            existing.setStatus(updatedUser.getStatus());
        }

        return userRepository.save(existing);
    }

    // Xóa user
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy user với ID: " + id);
        }
        userRepository.deleteById(id);
    }

    // Thay đổi trạng thái user (ACTIVE / BANNED / INACTIVE)
    public User updateUserStatus(String id, User.UserStatus status) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + id));
        existing.setStatus(status);
        return userRepository.save(existing);
    }
}