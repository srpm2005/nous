package com.project.nous.repository;

import com.project.nous.domain.JobPosting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, UUID> {

    Optional<JobPosting> findByPostingHash(String postingHash);

    List<JobPosting> findByCompanyIdAndIsCurrentlyOpenTrue(UUID companyId);

    List<JobPosting> findByIsCurrentlyOpenTrue();

    @Query("SELECT j FROM JobPosting j JOIN FETCH j.company c WHERE j.isCurrentlyOpen = true AND (LOWER(j.title) LIKE LOWER(CONCAT('%', :roleTitle, '%')) OR LOWER(j.department) LIKE LOWER(CONCAT('%', :roleTitle, '%')))")
    List<JobPosting> searchOpeningsByRole(@Param("roleTitle") String roleTitle);

    @Query("SELECT j FROM JobPosting j JOIN FETCH j.company c WHERE j.isCurrentlyOpen = true")
    List<JobPosting> findAllOpenWithCompanies();

    @Query("SELECT j FROM JobPosting j JOIN FETCH j.company c")
    List<JobPosting> findAllWithCompanies();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByCompanyId(UUID companyId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM JobPosting j WHERE LOWER(j.company.name) NOT IN :verifiedNames")
    void deleteUnverifiedPostings(@Param("verifiedNames") java.util.Collection<String> verifiedNames);
}
