package com.project.nous.repository;

import com.project.nous.domain.JobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA Repository for managing {@link JobListing} entity persistence.
 */
@Repository
public interface JobListingRepository extends JpaRepository<JobListing, UUID> {

    /**
     * Find all job listings associated with a specific scan run ID.
     */
    List<JobListing> findByScanId(UUID scanId);

    /**
     * Find all job listings associated with a specific suggested role ID.
     */
    List<JobListing> findByRoleId(UUID roleId);

    /**
     * Delete all job listings associated with a scan ID.
     */
    void deleteByScanId(UUID scanId);
}
