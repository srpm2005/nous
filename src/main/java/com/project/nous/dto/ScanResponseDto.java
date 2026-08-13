package com.project.nous.dto;

import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.domain.SuggestedRole;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * Data Transfer Object for returning Scan status details to API callers.
 */
@Builder
public record ScanResponseDto(
        UUID scanId,
        UUID resumeId,
        ScanStatus status,
        String errorReason,
        Instant createdAt,
        Instant completedAt,
        String originalFilename,
        String bestMatchRole,
        Double matchConfidence,
        String matchReason
) {
    public static ScanResponseDto from(Scan scan) {
        if (scan == null) return null;
        return ScanResponseDto.builder()
                .scanId(scan.getId())
                .resumeId(scan.getResumeId())
                .status(scan.getStatus())
                .errorReason(scan.getErrorReason())
                .createdAt(scan.getCreatedAt())
                .completedAt(scan.getCompletedAt())
                .build();
    }

    public static ScanResponseDto from(Scan scan, String originalFilename, SuggestedRole topRole) {
        if (scan == null) return null;
        String roleTitle = topRole != null ? topRole.getRoleTitle() : null;
        Double confidence = topRole != null ? topRole.getConfidenceScore() : null;
        String reason = topRole != null ? topRole.getMatchReason() : null;

        return ScanResponseDto.builder()
                .scanId(scan.getId())
                .resumeId(scan.getResumeId())
                .status(scan.getStatus())
                .errorReason(scan.getErrorReason())
                .createdAt(scan.getCreatedAt())
                .completedAt(scan.getCompletedAt())
                .originalFilename(originalFilename)
                .bestMatchRole(roleTitle)
                .matchConfidence(confidence)
                .matchReason(reason)
                .build();
    }
}

