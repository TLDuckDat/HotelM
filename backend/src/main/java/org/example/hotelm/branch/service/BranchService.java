package org.example.hotelm.branch.service;

import org.example.hotelm.branch.dto.BranchCreateRequest;
import org.example.hotelm.branch.dto.BranchResponse;
import org.example.hotelm.branch.entity.Branch;

import java.util.List;

public interface BranchService {
    List<BranchResponse> getAllBranches();
    BranchResponse getBranchById(String id);
    BranchResponse createBranch(BranchCreateRequest request);
    BranchResponse updateBranch(String id, BranchCreateRequest request);
    BranchResponse updateBranchStatus(String id, Branch.BranchStatus status);
    void deleteBranch(String id);
}