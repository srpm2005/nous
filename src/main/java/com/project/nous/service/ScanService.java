package com.project.nous.service;

import com.project.nous.domain.Resume;
import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.exception.ResumeNotFoundException;
import com.project.nous.repository.ScanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Service managing asynchronous resume scan jobs and state machine transitions.
 *
 * <p>Phase 2 State Machine Lifecycle:
 * <pre>
 *   PENDING ➔ PROCESSING ➔ COMPLETE (or FAILED / PARTIAL)
 * </pre>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScanService {

    private final ScanRepository scanRepository;

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

            // Step 2: Simulate / Execute Async Work (Text validation, chunking, etc.)
            Thread.sleep(1000);

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
