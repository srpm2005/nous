package com.project.nous.dto;

import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
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
        Instant completedAt
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
}
