package org.example.hotelm.branch.repository;

import org.example.hotelm.branch.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BranchRepository extends JpaRepository<Branch, String> {
    List<Branch> findByStatus(Branch.BranchStatus status);
}