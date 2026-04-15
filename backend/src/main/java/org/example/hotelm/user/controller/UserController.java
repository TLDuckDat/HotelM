package org.example.hotelm.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.user.dto.UserCreateRequest;
import org.example.hotelm.user.dto.UserResponse;
import org.example.hotelm.user.dto.UserStatusUpdateRequest;
import org.example.hotelm.user.dto.UserUpdateRequest;
import org.example.hotelm.user.entity.User;
import org.example.hotelm.user.mapper.UserMapper;
import org.example.hotelm.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    // GET /users - Lấy tất cả user
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> data = userService.  getAllUsers().stream()
                .map(userMapper::toResponse)
                .toList();
        return ResponseEntity.ok(data);
    }

    // GET /users/{id} - Lấy user theo ID
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userMapper.toResponse(userService.getUserById(id)));
    }

    // POST /users - Tạo user mới
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserCreateRequest request) {
        User created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponse(created));
    }

    // PUT /users/{id} - Cập nhật user
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable String id, @Valid @RequestBody UserUpdateRequest request) {
        User updated = userService.updateUser(id, request);
        return ResponseEntity.ok(userMapper.toResponse(updated));
    }

    // DELETE /users/{id} - Xóa user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /users/{id}/status - Đổi trạng thái user
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable String id,
                                                     @Valid @RequestBody UserStatusUpdateRequest request) {
        User updated = userService.updateUserStatus(id, request.status());
        return ResponseEntity.ok(userMapper.toResponse(updated));
    }
}