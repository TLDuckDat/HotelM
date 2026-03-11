package org.example.hotelm.model;

import java.time.LocalDate;

public class User {
    public enum Role {
        USER,
        ADMIN,
        RECEPTIONIST
    }
    public enum UserStatus {
        ACTIVE,
        INACTIVE,
        BANNED
    }
    private String userID;
    private String fullName;
    private String phoneNumber;
    private String email;
    private String password;
    private Role role;
    private LocalDate createdAt;
    private UserStatus status;

}
