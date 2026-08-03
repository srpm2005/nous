package com.project.nous.dto;

import com.project.nous.domain.Resume;
import com.project.nous.domain.ScanStatus;
import lombok.Builder;

import java.time.Instant;
import java.util.UUID;

/**
 * API response DTO for resume operations.
 *
 * <p>{@code extractedTextPreview} returns only the first N characters of the
 * extracted text to keep responses lean. Clients that need the full text can
 * use a dedicated endpoint (added in later phases when needed).
 */
@Builder
public record ResumeResponseDto(
        UUID       id,
        String     userId,
        String     originalFilename,
        String     mimeType,
        Instant    uploadedAt,
        int        extractedCharCount,
        String     extractedTextPreview,
        String     extractedText,
        boolean    isDuplicate,
        UUID       scanId,
        ScanStatus scanStatus
) {
    /**
     * Map a {@link Resume} entity to this DTO without scan info.
     */
    public static ResumeResponseDto from(Resume resume, int previewLen, boolean isDuplicate) {
        return from(resume, previewLen, isDuplicate, null, null);
    }

    /**
     * Map a {@link Resume} entity to this DTO with scan details.
     */
    public static ResumeResponseDto from(Resume resume, int previewLen, boolean isDuplicate,
                                         UUID scanId, ScanStatus scanStatus) {
        String text    = resume.getExtractedText() != null ? resume.getExtractedText() : "";
        String preview = text.length() > previewLen ? text.substring(0, previewLen) + "…" : text;

        return ResumeResponseDto.builder()
                .id(resume.getId())
                .userId(resume.getUserId())
                .originalFilename(resume.getOriginalFilename())
                .mimeType(resume.getMimeType())
                .uploadedAt(resume.getUploadedAt())
                .extractedCharCount(text.length())
                .extractedTextPreview(preview)
                .extractedText(text)
                .isDuplicate(isDuplicate)
                .scanId(scanId)
                .scanStatus(scanStatus)
                .build();
    }
}

