package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Represents a resume uploaded by a user.
 * Phase 1: stores file metadata and extracted plain text.
 * Later phases will link this to the scans pipeline.
 */
@Entity
@Table(name = "resumes", indexes = {
        @Index(name = "idx_resumes_file_hash", columnList = "file_hash"),
        @Index(name = "idx_resumes_user_id",   columnList = "user_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Placeholder until Spring Security + JWT lands in a later phase.
     * Will become a FK to a users table.
     */
    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @Column(name = "original_filename", nullable = false, length = 512)
    private String originalFilename;

    /** Absolute path on disk where the file is stored (Phase 1 local; S3 URI later). */
    @Column(name = "stored_file_path", nullable = false, length = 2048)
    private String storedFilePath;

    /** Detected MIME type (from Tika magic-byte check, not the client header). */
    @Column(name = "mime_type", nullable = false, length = 128)
    private String mimeType;

    /**
     * SHA-256 hex digest of the original file bytes.
     * Used for dedup: if the same file is uploaded again we return the
     * existing record rather than re-running the pipeline.
     */
    @Column(name = "file_hash", nullable = false, length = 64, unique = true)
    private String fileHash;

    /** Raw text extracted by PDFBox / POI. Not logged to avoid PII in logs. */
    @Column(name = "extracted_text", columnDefinition = "TEXT")
    private String extractedText;

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    @PrePersist
    void prePersist() {
        if (uploadedAt == null) {
            uploadedAt = Instant.now();
        }
    }
}
