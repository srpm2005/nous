package com.project.nous.repository;

import com.project.nous.domain.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link Resume}.
 * The {@code findByFileHash} method is used for deduplication — if the same
 * file (by SHA-256) is uploaded again, we return the existing record instead
 * of re-running extraction.
 */
@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {

    Optional<Resume> findByFileHash(String fileHash);
}
