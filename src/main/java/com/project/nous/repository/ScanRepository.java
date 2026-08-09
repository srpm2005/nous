package com.project.nous.repository;

import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Scan}.
 * Manages persistence and status queries for async processing jobs.
 */
@Repository
public interface ScanRepository extends JpaRepository<Scan, UUID> {

    /**
     * Find all scans associated with a specific resume.
     */
    List<Scan> findByResumeId(UUID resumeId);

    /**
     * Find all scans currently in a given status (e.g. PENDING or PROCESSING).
     */
    List<Scan> findByStatus(ScanStatus status);

    /**
     * Find all scans associated with a user ID (across all of their uploaded resumes),
     * ordered by creation timestamp descending.
     */
    @Query("SELECT s FROM Scan s WHERE s.resumeId IN (SELECT r.id FROM Resume r WHERE r.userId = :userId) ORDER BY s.createdAt DESC")
    List<Scan> findByUserId(@Param("userId") String userId);

    /**
     * Delete all scans associated with a specific resume ID.
     */
    void deleteByResumeId(UUID resumeId);
}

