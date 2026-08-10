package com.project.nous.service;

import com.project.nous.domain.Resume;
import com.project.nous.exception.ResumeNotFoundException;
import com.project.nous.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

/**
 * Orchestrates the Phase 1 upload pipeline:
 *
 * <pre>
 *  validate → virus scan → dedup check → save to disk → extract text → persist
 * </pre>
 *
 * Steps are intentionally kept in this order so we:
 * <ul>
 *   <li>Reject bad files <em>before</em> touching the filesystem.</li>
 *   <li>Avoid re-running extraction for duplicate uploads (same SHA-256).</li>
 *   <li>Only write to disk after the virus scan passes.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private final FileValidationService fileValidationService;
    private final VirusScanner          virusScanner;
    private final TextExtractionService textExtractionService;
    private final ResumeRepository      resumeRepository;
    private final ScanService           scanService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    // ─── Upload ─────────────────────────────────────────────────────────────

    /**
     * Process an uploaded resume file end-to-end.
     *
     * @param file   the multipart file from the HTTP request
     * @param userId caller identity (placeholder string until auth lands)
     * @return {@link UploadResult} containing the resume entity and a dedup flag
     */
    @Transactional
    public UploadResult upload(MultipartFile file, String userId) throws IOException {
        // 1. Validate MIME type + size
        String detectedMime = fileValidationService.validate(file);

        // 2. Read bytes once — reused for hashing, virus scan temp file, extraction
        byte[] fileBytes = file.getBytes();

        // 3. Compute SHA-256 for dedup
        String fileHash = sha256Hex(fileBytes);
        log.info("Received upload from user '{}', file='{}', hash={}",
                userId, file.getOriginalFilename(), fileHash);

        // If same file hash exists in DB, reuse existing resume entity to prevent SQL unique constraint error
        return resumeRepository.findByFileHash(fileHash)
                .map(existing -> {
                    log.info("Resume file hash already exists in DB. Reusing entity id={} for fresh scan.", existing.getId());
                    return new UploadResult(existing, false);
                })
                .orElseGet(() -> {
                    Resume fresh = processNewUpload(file, userId, fileBytes, fileHash, detectedMime);
                    return new UploadResult(fresh, false);
                });
    }



    /**
     * Retrieve a resume by its ID.
     */
    @Transactional(readOnly = true)
    public Resume findById(UUID id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new ResumeNotFoundException(id.toString()));
    }

    /**
     * Delete a resume — removes the DB record, file on disk, and associated scan history.
     * Required for privacy compliance (right to erasure).
     */
    @Transactional
    public void delete(UUID id) throws IOException {
        Resume resume = findById(id);
        Path filePath = Paths.get(resume.getStoredFilePath());

        // Delete associated scans, roles, and job listings
        scanService.deleteScansAndDataByResumeId(id);

        // Delete from disk first — if this fails we'd still have the DB row (safer than the reverse)
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("Deleted file from disk: {}", filePath);
        } else {
            log.warn("File not found on disk during delete (resume id={}): {}", id, filePath);
        }

        resumeRepository.delete(resume);
        log.info("Deleted resume record from DB: id={}", id);
    }


    // ─── Private helpers ────────────────────────────────────────────────────

    private Resume processNewUpload(MultipartFile file, String userId,
                                    byte[] fileBytes, String fileHash, String detectedMime) {
        try {
            // 5. Write to a temp location first so the virus scanner can read it
            Path uploadPath = ensureUploadDir();
            String safeFilename = fileHash + "_" + sanitiseFilename(file.getOriginalFilename());
            Path destination   = uploadPath.resolve(safeFilename);

            Files.write(destination, fileBytes);
            log.info("Temporarily stored file at: {}", destination);

            // 6. Virus scan (NoOp by default; ClamAV when enabled)
            try {
                virusScanner.scan(destination);
            } catch (Exception ex) {
                // If the scan fails/rejects, remove the temp file and re-throw
                Files.deleteIfExists(destination);
                throw ex;
            }

            // 7. Extract text
            String extractedText = textExtractionService.extract(fileBytes, detectedMime);

            // 8. Persist entity
            Resume resume = Resume.builder()
                    .userId(userId)
                    .originalFilename(file.getOriginalFilename())
                    .storedFilePath(destination.toAbsolutePath().toString())
                    .mimeType(detectedMime)
                    .fileHash(fileHash)
                    .extractedText(extractedText)
                    .build();

            Resume saved = resumeRepository.save(resume);
            log.info("Persisted new resume id={} for user '{}'", saved.getId(), userId);
            return saved;

        } catch (IOException ex) {
            log.error("I/O error during upload processing: {}", ex.getMessage());
            throw new RuntimeException("Failed to process uploaded file.", ex);
        }
    }

    private Path ensureUploadDir() throws IOException {
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(dir);
        return dir;
    }

    /**
     * Sanitise an original filename to a safe string — strip path separators and
     * keep only alphanumeric, dash, underscore, and dot characters.
     */
    private String sanitiseFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            return "resume";
        }
        // Take basename only, then strip anything that's not safe
        String basename = Paths.get(originalFilename).getFileName().toString();
        return basename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String sha256Hex(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(data));
        } catch (NoSuchAlgorithmException ex) {
            // SHA-256 is guaranteed present in every JVM per the spec
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
