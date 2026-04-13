package org.example.hotelm.user.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String userID;

    private String fullName;
    private String phoneNumber;
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDate createdAt;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

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
}

