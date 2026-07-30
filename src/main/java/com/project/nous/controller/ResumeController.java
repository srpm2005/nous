package com.project.nous.controller;

import com.project.nous.domain.Resume;
import com.project.nous.dto.ResumeResponseDto;
import com.project.nous.service.ResumeService;
import com.project.nous.service.UploadResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * REST controller for resume upload and management.
 *
 * <h3>Phase 1 endpoints:</h3>
 * <ul>
 *   <li>{@code POST   /api/resumes}        — upload file, returns 201</li>
 *   <li>{@code GET    /api/resumes/{id}}   — fetch resume metadata + text preview</li>
 *   <li>{@code DELETE /api/resumes/{id}}   — delete resume (privacy / right to erasure)</li>
 * </ul>
 *
 * <p>No auth in Phase 1 — {@code userId} defaults to {@code "anonymous"} until
 * Spring Security + JWT lands in a later phase.
 */
@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @Value("${app.upload.text-preview-length:500}")
    private int textPreviewLength;

    // ─── Upload ─────────────────────────────────────────────────────────────

    /**
     * Upload a resume file (PDF or DOCX).
     *
     * <p>Returns {@code 201 Created} on a fresh upload, or {@code 200 OK} if the
     * same file (by SHA-256) was already uploaded — the {@code isDuplicate} flag
     * in the response body distinguishes the two cases.
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ResumeResponseDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", defaultValue = "anonymous") String userId)
            throws IOException {

        log.info("POST /api/resumes — filename='{}', size={}, userId={}",
                file.getOriginalFilename(), file.getSize(), userId);

        UploadResult result = resumeService.upload(file, userId);
        ResumeResponseDto body = ResumeResponseDto.from(result.resume(), textPreviewLength, result.isDuplicate());

        // 200 for deduplicated (already existed), 201 for fresh upload
        HttpStatus status = result.isDuplicate() ? HttpStatus.OK : HttpStatus.CREATED;
        return ResponseEntity.status(status).body(body);
    }

    // ─── Fetch ──────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponseDto> getById(@PathVariable UUID id) {
        log.info("GET /api/resumes/{}", id);
        Resume resume = resumeService.findById(id);
        return ResponseEntity.ok(ResumeResponseDto.from(resume, textPreviewLength, false));
    }

    @GetMapping(value = "/{id}/text", produces = org.springframework.http.MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getFullText(@PathVariable UUID id) {
        log.info("GET /api/resumes/{}/text", id);
        Resume resume = resumeService.findById(id);
        return ResponseEntity.ok(resume.getExtractedText());
    }

    // ─── Delete ─────────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) throws IOException {
        log.info("DELETE /api/resumes/{}", id);
        resumeService.delete(id);
    }

}
