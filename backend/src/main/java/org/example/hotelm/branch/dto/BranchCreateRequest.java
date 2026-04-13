package org.example.hotelm.branch.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchCreateRequest {

    @NotBlank(message = "Branch name is required")
    private String branchName;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;
    private String phone;

    @Email(message = "Email format is invalid")
    private String email;
}