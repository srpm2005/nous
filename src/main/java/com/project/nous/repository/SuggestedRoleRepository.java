package com.project.nous.repository;

import com.project.nous.domain.SuggestedRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA Repository for managing SuggestedRole persistence and scan lookups.
 */
@Repository
public interface SuggestedRoleRepository extends JpaRepository<SuggestedRole, UUID> {

    /**
     * Retrieve all AI suggested roles associated with a specific scan ID, ordered by rank ascending.
     */
    List<SuggestedRole> findByScanIdOrderByRankOrderAsc(UUID scanId);

    /**
     * Delete all suggested roles for a given scan ID.
     */
    void deleteByScanId(UUID scanId);
}
