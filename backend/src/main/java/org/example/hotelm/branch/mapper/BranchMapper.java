package org.example.hotelm.branch.mapper;

import org.example.hotelm.branch.dto.BranchCreateRequest;
import org.example.hotelm.branch.dto.BranchResponse;
import org.example.hotelm.branch.entity.Branch;
import org.springframework.stereotype.Component;

@Component
public class BranchMapper {

    public Branch toEntity(BranchCreateRequest request) {
        Branch branch = new Branch();
        branch.setBranchName(request.getBranchName());
        branch.setAddress(request.getAddress());
        branch.setCity(request.getCity());
        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setStatus(Branch.BranchStatus.ACTIVE);
        return branch;
    }

    public BranchResponse toResponse(Branch branch) {
        return new BranchResponse(
                branch.getBranchId(),
                branch.getBranchName(),
                branch.getAddress(),
                branch.getCity(),
                branch.getPhone(),
                branch.getEmail(),
                branch.getStatus()
        );
    }
}
