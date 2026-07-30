package com.project.nous.dto;

import com.project.nous.domain.Resume;
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
        UUID    id,
        String  userId,
        String  originalFilename,
        String  mimeType,
        Instant uploadedAt,
        int     extractedCharCount,
        String  extractedTextPreview,
        String  extractedText,
        boolean isDuplicate
) {
    /**
     * Map a {@link Resume} entity to this DTO.
     *
     * @param resume      the entity
     * @param previewLen  number of characters to include in the preview
     * @param isDuplicate whether this was a deduplicated upload
     */
    public static ResumeResponseDto from(Resume resume, int previewLen, boolean isDuplicate) {
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
                .build();
    }
}
