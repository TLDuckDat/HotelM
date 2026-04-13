package org.example.hotelm.kpi.repository;

import org.example.hotelm.kpi.entity.BranchKPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchKPIRepository extends JpaRepository<BranchKPI, String> {

    List<BranchKPI> findByBranch_BranchId(String branchId);
    Optional<BranchKPI> findByBranch_BranchIdAndYearAndMonth(String branchId, int year, int month);
    List<BranchKPI> findByYearAndMonth(int year, int month);
}