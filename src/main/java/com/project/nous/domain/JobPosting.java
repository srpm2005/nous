package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing an individual job posting scraped from a Top 500 company portal.
 * Uses SHA-256 posting_hash for deduplication and soft expiration via isCurrentlyOpen.
 */
@Entity
@Table(name = "job_postings", indexes = {
        @Index(name = "idx_job_postings_hash", columnList = "posting_hash", unique = true),
        @Index(name = "idx_job_postings_company", columnList = "company_id"),
        @Index(name = "idx_job_postings_open", columnList = "is_currently_open")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPosting {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "external_id")
    private String externalId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(name = "location", columnDefinition = "TEXT")
    private String location;

    @Column(name = "department", columnDefinition = "TEXT")
    private String department;

    @Column(name = "apply_url", nullable = false, columnDefinition = "TEXT")
    private String applyUrl;

    @Column(name = "posting_hash", nullable = false, length = 64, unique = true)
    private String postingHash; // SHA-256 of (company_id + title + apply_url)

    @Column(name = "first_seen_at", nullable = false)
    private LocalDateTime firstSeenAt;

    @Column(name = "last_seen_at", nullable = false)
    private LocalDateTime lastSeenAt;

    @Builder.Default
    @Column(name = "is_currently_open", nullable = false)
    private Boolean isCurrentlyOpen = true;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "salary_range", length = 250)
    private String salaryRange;
}
