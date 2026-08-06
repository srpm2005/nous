package com.project.nous.service;

import com.project.nous.domain.Resume;
import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.domain.SuggestedRole;
import com.project.nous.dto.LlmResponseDto;
import com.project.nous.dto.RoleSuggestionDto;
import com.project.nous.repository.ResumeRepository;
import com.project.nous.repository.ScanRepository;
import com.project.nous.repository.SuggestedRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Service managing asynchronous resume scan jobs, LLM role extraction, and state machine transitions.
 *
 * <p>Phase 2 & Phase 3 Lifecycle:
 * <pre>
 *   PENDING ➔ PROCESSING ➔ Role Extraction ➔ COMPLETE (or FAILED / PARTIAL)
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScanService {

    private final ScanRepository scanRepository;
    private final ResumeRepository resumeRepository;
    private final LlmRoleExtractionService llmRoleExtractionService;
    private final SuggestedRoleRepository suggestedRoleRepository;

    /**
     * Synchronously initialize a Scan record with status PENDING.
     */
    @Transactional
    public Scan createInitialScan(Resume resume) {
        Scan scan = Scan.builder()
                .resumeId(resume.getId())
                .status(ScanStatus.PENDING)
                .createdAt(Instant.now())
                .build();
        Scan saved = scanRepository.save(scan);
        log.info("Scan record initialized with ID {} for resume {}", saved.getId(), resume.getId());
        return saved;
    }

    /**
     * Fetch scan status details by scan ID.
     */
    @Transactional(readOnly = true)
    public Scan getScanById(UUID scanId) {
        return scanRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("Scan not found with ID: " + scanId));
    }

    /**
     * Fetch all scans submitted for a given resume UUID.
     */
    @Transactional(readOnly = true)
    public List<Scan> getScansByResumeId(UUID resumeId) {
        return scanRepository.findByResumeId(resumeId);
    }

    /**
     * Retrieve suggested roles for a scan ID.
     */
    @Transactional(readOnly = true)
    public List<SuggestedRole> getSuggestedRolesByScanId(UUID scanId) {
        return suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(scanId);
    }

    /**
     * Retrieve suggested roles for the latest scan of a given resume ID.
     */
    @Transactional(readOnly = true)
    public List<SuggestedRole> getSuggestedRolesByResumeId(UUID resumeId) {
        List<Scan> scans = scanRepository.findByResumeId(resumeId);
        if (scans.isEmpty()) {
            return List.of();
        }
        Scan latestScan = scans.get(scans.size() - 1);
        return suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(latestScan.getId());
    }

    /**
     * Asynchronously process the scan pipeline in a background worker thread.
     */
    @Async("scanTaskExecutor")
    @Transactional
    public void processScanAsync(UUID scanId) {
        log.info("[{}] Starting background async scan processing for scanId {}",
                Thread.currentThread().getName(), scanId);

        Scan scan = scanRepository.findById(scanId)
                .orElseThrow(() -> new IllegalArgumentException("Scan not found with ID: " + scanId));

        try {
            // Step 1: Transition status to PROCESSING
            scan.setStatus(ScanStatus.PROCESSING);
            scanRepository.save(scan);
            log.info("Scan {} state updated to PROCESSING", scanId);

            // Step 2: Load Resume text and perform AI Role Extraction
            Resume resume = resumeRepository.findById(scan.getResumeId()).orElse(null);
            if (resume != null && resume.getExtractedText() != null && !resume.getExtractedText().isBlank()) {
                LlmResponseDto llmResponse = llmRoleExtractionService.extractRoles(resume.getExtractedText());

                if (llmResponse != null && llmResponse.getRoles() != null && !llmResponse.getRoles().isEmpty()) {
                    suggestedRoleRepository.deleteByScanId(scanId);

                    List<SuggestedRole> rolesToSave = new ArrayList<>();
                    for (RoleSuggestionDto dto : llmResponse.getRoles()) {
                        String skillsCsv = dto.getKeySkills() != null ? String.join(",", dto.getKeySkills()) : "";
                        SuggestedRole role = SuggestedRole.builder()
                                .scanId(scanId)
                                .roleTitle(dto.getRoleTitle())
                                .rankOrder(dto.getRank() != null ? dto.getRank() : 1)
                                .confidenceScore(dto.getConfidenceScore() != null ? dto.getConfidenceScore() : 0.85)
                                .matchReason(dto.getMatchReason())
                                .keySkillsCsv(skillsCsv)
                                .build();
                        rolesToSave.add(role);
                    }
                    suggestedRoleRepository.saveAll(rolesToSave);
                    log.info("Successfully extracted and saved {} AI suggested roles for scan {}", rolesToSave.size(), scanId);
                }
            } else {
                log.warn("Resume text is empty or missing for scan {}. Skipping AI role extraction.", scanId);
            }

            // Step 3: Transition status to COMPLETE
            scan.setStatus(ScanStatus.COMPLETE);
            scan.setCompletedAt(Instant.now());
            scanRepository.save(scan);
            log.info("Scan {} processing finished successfully. Status: COMPLETE", scanId);

        } catch (Exception e) {
            log.error("Failed executing scan pipeline for scanId {}", scanId, e);
            scan.setStatus(ScanStatus.FAILED);
            scan.setErrorReason(e.getMessage());
            scan.setCompletedAt(Instant.now());
            scanRepository.save(scan);
        }
    }
}

