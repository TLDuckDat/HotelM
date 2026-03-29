package org.example.hotelm.user.mapper;

import org.example.hotelm.user.dto.UserResponse;
import org.example.hotelm.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserID(),
                user.getFullName(),
                user.getPhoneNumber(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt(),
                user.getStatus()
        );
    }
}
