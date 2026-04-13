package org.example.hotelm.branch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String branchId;

    private String branchName;
    private String address;
    private String city;
    private String phone;
    private String email;

    @Enumerated(EnumType.STRING)
    private BranchStatus status;

    public enum BranchStatus {
        ACTIVE,
        INACTIVE
    }
}