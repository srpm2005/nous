package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity representing an AI-extracted target job role inferred from a candidate's resume.
 * Phase 3: Persists suggested roles, rank, confidence score, rationale, and extracted skills.
 */
@Entity
@Table(name = "suggested_roles", indexes = {
        @Index(name = "idx_suggested_roles_scan_id", columnList = "scan_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedRole {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * FK referencing the scan execution run.
     */
    @Column(name = "scan_id", nullable = false)
    private UUID scanId;

    /**
     * Inferred target job title (e.g., "Senior Java Backend Engineer").
     */
    @Column(name = "role_title", nullable = false, length = 255)
    private String roleTitle;

    /**
     * Ranking index of suitability (1 = top recommendation).
     */
    @Column(name = "rank_order", nullable = false)
    private Integer rankOrder;

    /**
     * Match confidence score normalized between 0.00 and 1.00.
     */
    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;

    /**
     * AI-generated match rationale highlighting key alignment factors.
     */
    @Column(name = "match_reason", columnDefinition = "TEXT")
    private String matchReason;

    /**
     * Comma-separated key skills extracted relevant to this target role.
     */
    @Column(name = "key_skills_csv", columnDefinition = "TEXT")
    private String keySkillsCsv;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
