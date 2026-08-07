package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing a normalized job posting retrieved from an external job search provider.
 * Phase 4: Persists job title, company, location, salary range, application URL, and provider attribution.
 */
@Entity
@Table(name = "job_listings", indexes = {
        @Index(name = "idx_job_listings_scan_id", columnList = "scan_id"),
        @Index(name = "idx_job_listings_role_id", columnList = "role_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobListing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "scan_id", nullable = false)
    private UUID scanId;

    @Column(name = "role_id", nullable = false)
    private UUID roleId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "company", nullable = false, length = 255)
    private String company;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "salary_range", length = 100)
    private String salaryRange;

    @Column(name = "apply_url", nullable = false, columnDefinition = "TEXT")
    private String applyUrl;

    @Column(name = "source_api", nullable = false, length = 50)
    private String sourceApi;

    @Column(name = "fetched_at", nullable = false, updatable = false)
    private Instant fetchedAt;

    @PrePersist
    void prePersist() {
        if (fetchedAt == null) {
            fetchedAt = Instant.now();
        }
    }
}
