package org.example.hotelm.branch.dto;

import org.example.hotelm.branch.entity.Branch;

public record BranchResponse(
        String branchId,
        String branchName,
        String address,
        String city,
        String phone,
        String email,
        Branch.BranchStatus status
) {}