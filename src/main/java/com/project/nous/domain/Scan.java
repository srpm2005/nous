package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents an asynchronous processing pipeline run for an uploaded resume.
 * Phase 2: Tracks status machine state (PENDING, PROCESSING, COMPLETE, PARTIAL, FAILED).
 */
@Entity
@Table(name = "scans", indexes = {
        @Index(name = "idx_scans_resume_id", columnList = "resume_id"),
        @Index(name = "idx_scans_status",    columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * FK linking to the uploaded resume being processed.
     */
    @Column(name = "resume_id", nullable = false)
    private UUID resumeId;

    /**
     * Current lifecycle state of the scan.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ScanStatus status;

    /**
     * Optional error details if the scan status is FAILED or PARTIAL.
     */
    @Column(name = "error_reason", columnDefinition = "TEXT")
    private String errorReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (status == null) {
            status = ScanStatus.PENDING;
        }
    }
}
