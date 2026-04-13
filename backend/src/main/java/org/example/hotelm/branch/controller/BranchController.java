package org.example.hotelm.branch.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.hotelm.branch.dto.BranchCreateRequest;
import org.example.hotelm.branch.dto.BranchResponse;
import org.example.hotelm.branch.entity.Branch;
import org.example.hotelm.branch.service.BranchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getBranchById(@PathVariable String id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @PostMapping
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(branchService.createBranch(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BranchResponse> updateBranch(@PathVariable String id,
                                                       @Valid @RequestBody BranchCreateRequest request) {
        return ResponseEntity.ok(branchService.updateBranch(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BranchResponse> updateStatus(@PathVariable String id,
                                                       @RequestParam Branch.BranchStatus status) {
        return ResponseEntity.ok(branchService.updateBranchStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBranch(@PathVariable String id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }
}