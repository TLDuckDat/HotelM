package org.example.hotelm.user.service;

import org.example.hotelm.user.dto.UserCreateRequest;
import org.example.hotelm.user.dto.UserUpdateRequest;
import org.example.hotelm.user.entity.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();
    User getUserById(String id);
    User createUser(UserCreateRequest request);
    User updateUser(String id, UserUpdateRequest request);
    void deleteUser(String id);
    User updateUserStatus(String id, User.UserStatus status);
}