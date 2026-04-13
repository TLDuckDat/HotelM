package org.example.hotelm.branch.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.hotelm.branch.dto.BranchCreateRequest;
import org.example.hotelm.branch.dto.BranchResponse;
import org.example.hotelm.branch.entity.Branch;
import org.example.hotelm.branch.mapper.BranchMapper;
import org.example.hotelm.branch.repository.BranchRepository;
import org.example.hotelm.branch.service.BranchService;
import org.example.hotelm.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;

    @Override
    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(branchMapper::toResponse)
                .toList();
    }

    @Override
    public BranchResponse getBranchById(String id) {
        return branchMapper.toResponse(findOrThrow(id));
    }

    @Override
    public BranchResponse createBranch(BranchCreateRequest request) {
        Branch branch = branchMapper.toEntity(request);
        return branchMapper.toResponse(branchRepository.save(branch));
    }

    @Override
    public BranchResponse updateBranch(String id, BranchCreateRequest request) {
        Branch existing = findOrThrow(id);
        existing.setBranchName(request.getBranchName());
        existing.setAddress(request.getAddress());
        existing.setCity(request.getCity());
        existing.setPhone(request.getPhone());
        existing.setEmail(request.getEmail());
        return branchMapper.toResponse(branchRepository.save(existing));
    }

    @Override
    public BranchResponse updateBranchStatus(String id, Branch.BranchStatus status) {
        Branch existing = findOrThrow(id);
        existing.setStatus(status);
        return branchMapper.toResponse(branchRepository.save(existing));
    }

    @Override
    public void deleteBranch(String id) {
        if (!branchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id);
        }
        branchRepository.deleteById(id);
    }

    private Branch findOrThrow(String id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));
    }
}