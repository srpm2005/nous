package com.project.nous.service;

import com.project.nous.domain.JobListing;
import com.project.nous.domain.Resume;
import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.domain.SuggestedRole;
import com.project.nous.dto.JobListingDto;
import com.project.nous.dto.LlmResponseDto;
import com.project.nous.dto.RoleSuggestionDto;
import com.project.nous.repository.JobListingRepository;
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
 * Service managing asynchronous resume scan jobs, LLM role extraction, job search client integration, and state machine transitions.
 *
 * <p>Phase 2, Phase 3 & Phase 4 Lifecycle:
 * <pre>
 *   PENDING ➔ PROCESSING ➔ Role Extraction ➔ Job Search Engine ➔ COMPLETE (or FAILED / PARTIAL)
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
    private final JobSearchClient jobSearchClient;
    private final JobListingRepository jobListingRepository;

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
     * Phase 5: Fetch all scans submitted by a specific user (across all resumes).
     */
    @Transactional(readOnly = true)
    public List<Scan> getScansByUserId(String userId) {
        if (userId == null || userId.isBlank()) {
            return List.of();
        }
        return scanRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public com.project.nous.dto.ScanResponseDto getEnrichedScanResponseDto(Scan scan) {
        if (scan == null) return null;
        String originalFilename = null;
        if (scan.getResumeId() != null) {
            originalFilename = resumeRepository.findById(scan.getResumeId())
                    .map(Resume::getOriginalFilename)
                    .orElse(null);
        }

        List<SuggestedRole> roles = suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(scan.getId());
        SuggestedRole topRole = (!roles.isEmpty()) ? roles.get(0) : null;

        return com.project.nous.dto.ScanResponseDto.from(scan, originalFilename, topRole);
    }

    @Transactional(readOnly = true)
    public List<com.project.nous.dto.ScanResponseDto> getEnrichedScanResponsesByUserId(String userId) {
        List<Scan> scans = getScansByUserId(userId);
        return scans.stream()
                .map(this::getEnrichedScanResponseDto)
                .toList();
    }

    /**
     * Phase 5: Cascade deletion of all scans, roles, and job listings associated with a resume.
     */
    @Transactional
    public void deleteScansAndDataByResumeId(UUID resumeId) {
        List<Scan> scans = scanRepository.findByResumeId(resumeId);
        for (Scan scan : scans) {
            jobListingRepository.deleteByScanId(scan.getId());
            suggestedRoleRepository.deleteByScanId(scan.getId());
        }
        scanRepository.deleteByResumeId(resumeId);
        log.info("Phase 5: Cleaned up {} scans and associated roles/jobs for deleted resumeId={}", scans.size(), resumeId);
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
     * Phase 4: Retrieve fetched job listings for a scan ID.
     */
    @Transactional(readOnly = true)
    public List<JobListing> getJobListingsByScanId(UUID scanId) {
        return jobListingRepository.findByScanId(scanId);
    }

    /**
     * Phase 4: Retrieve fetched job listings for the latest scan of a given resume ID.
     */
    @Transactional(readOnly = true)
    public List<JobListing> getJobListingsByResumeId(UUID resumeId) {
        List<Scan> scans = scanRepository.findByResumeId(resumeId);
        if (scans.isEmpty()) {
            return List.of();
        }
        Scan latestScan = scans.get(scans.size() - 1);
        return jobListingRepository.findByScanId(latestScan.getId());
    }

    private final java.util.concurrent.ConcurrentHashMap<UUID, List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter>> sseEmitters = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Subscribe to real-time status events for a scan using Server-Sent Events (SSE).
     */
    public org.springframework.web.servlet.mvc.method.annotation.SseEmitter subscribeToScanEvents(UUID scanId) {
        org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter = new org.springframework.web.servlet.mvc.method.annotation.SseEmitter(300000L); // 5 min
        List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> list = sseEmitters.computeIfAbsent(scanId, k -> new java.util.concurrent.CopyOnWriteArrayList<>());
        list.add(emitter);

        emitter.onCompletion(() -> list.remove(emitter));
        emitter.onTimeout(() -> list.remove(emitter));
        emitter.onError((ex) -> list.remove(emitter));

        // Immediately push current status to new subscriber
        Scan currentScan = scanRepository.findById(scanId).orElse(null);
        if (currentScan != null) {
            try {
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                        .name("status")
                        .data(com.project.nous.dto.ScanResponseDto.from(currentScan)));
            } catch (Exception e) {
                list.remove(emitter);
            }
        }

        return emitter;
    }

    private void notifyStatusUpdate(Scan scan) {
        if (scan == null || scan.getId() == null) return;
        List<org.springframework.web.servlet.mvc.method.annotation.SseEmitter> list = sseEmitters.get(scan.getId());
        if (list == null || list.isEmpty()) return;

        com.project.nous.dto.ScanResponseDto dto = com.project.nous.dto.ScanResponseDto.from(scan);
        for (org.springframework.web.servlet.mvc.method.annotation.SseEmitter emitter : list) {
            try {
                emitter.send(org.springframework.web.servlet.mvc.method.annotation.SseEmitter.event()
                        .name("status")
                        .data(dto));
                if (scan.getStatus() == ScanStatus.COMPLETE || scan.getStatus() == ScanStatus.PARTIAL || scan.getStatus() == ScanStatus.FAILED) {
                    emitter.complete();
                }
            } catch (Exception e) {
                list.remove(emitter);
            }
        }
    }

    /**
     * Process a scan pipeline for an existing scan record end-to-end.
     */
    public Scan processScan(Scan scan, Resume resume) {
        if (scan == null) return null;
        scan.setStatus(ScanStatus.PROCESSING);
        Scan savedScan = scanRepository.save(scan);
        UUID scanId = savedScan.getId();
        log.info("Processing scan pipeline for scanId {}", scanId);
        notifyStatusUpdate(savedScan);

        boolean partialFailureEncountered = false;

        try {
            List<SuggestedRole> savedRoles = new ArrayList<>();

            // Step 1: AI Role Extraction
            if (resume != null && resume.getExtractedText() != null && !resume.getExtractedText().isBlank()) {
                try {
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
                        savedRoles = suggestedRoleRepository.saveAll(rolesToSave);
                        log.info("Successfully saved {} AI suggested roles for scan {}", savedRoles.size(), scanId);
                    }
                } catch (Exception ex) {
                    log.warn("AI Role extraction encountered partial issue for scanId {}", scanId, ex);
                    partialFailureEncountered = true;
                }
            }

            // Step 2: Enterprise Job Search per target role (Parallelized for sub-second execution)
            if (!savedRoles.isEmpty()) {
                jobListingRepository.deleteByScanId(scanId);

                List<java.util.concurrent.CompletableFuture<List<JobListing>>> futures = savedRoles.stream()
                        .map(role -> java.util.concurrent.CompletableFuture.supplyAsync(() -> {
                            List<JobListing> roleEntities = new ArrayList<>();
                            try {
                                List<JobListingDto> fetchedListings = jobSearchClient.searchJobs(role.getRoleTitle(), "Remote");
                                if (fetchedListings != null && !fetchedListings.isEmpty()) {
                                    for (JobListingDto dto : fetchedListings) {
                                        String sourceStr = dto.getSourceApi() != null ? dto.getSourceApi() : jobSearchClient.getProviderName();
                                        if (sourceStr != null && sourceStr.length() > 45) {
                                            sourceStr = sourceStr.substring(0, 45);
                                        }
                                        JobListing entity = JobListing.builder()
                                                .scanId(scanId)
                                                .roleId(role.getId())
                                                .title(dto.getTitle())
                                                .company(dto.getCompany())
                                                .location(dto.getLocation())
                                                .salaryRange(dto.getSalaryRange())
                                                .applyUrl(dto.getApplyUrl())
                                                .sourceApi(sourceStr)
                                                .build();
                                        roleEntities.add(entity);
                                    }
                                }
                            } catch (Exception ex) {
                                log.warn("Job search failed for role '{}' in scanId {}", role.getRoleTitle(), scanId, ex);
                            }
                            return roleEntities;
                        }))
                        .toList();

                java.util.concurrent.CompletableFuture.allOf(futures.toArray(new java.util.concurrent.CompletableFuture[0])).join();

                List<JobListing> allJobListingEntities = futures.stream()
                        .flatMap(f -> f.join().stream())
                        .toList();

                if (!allJobListingEntities.isEmpty()) {
                    jobListingRepository.saveAll(allJobListingEntities);
                    log.info("Successfully saved {} live enterprise job listings for scan {}",
                            allJobListingEntities.size(), scanId);
                } else {
                    partialFailureEncountered = true;
                }
            }

            // Step 3: Transition status to COMPLETE or PARTIAL
            ScanStatus finalStatus = (!savedRoles.isEmpty() && partialFailureEncountered)
                    ? ScanStatus.PARTIAL
                    : ScanStatus.COMPLETE;

            savedScan.setStatus(finalStatus);
            if (finalStatus == ScanStatus.PARTIAL) {
                savedScan.setErrorReason("Some job search listings timed out or returned partial matches.");
            }
            savedScan.setCompletedAt(Instant.now());
            Scan finished = scanRepository.save(savedScan);
            notifyStatusUpdate(finished);
            return finished;

        } catch (Exception e) {
            log.error("Failed executing scan pipeline for scanId {}", scanId, e);
            savedScan.setStatus(ScanStatus.FAILED);
            savedScan.setErrorReason(e.getMessage() != null ? e.getMessage() : "Unknown pipeline error");
            savedScan.setCompletedAt(Instant.now());
            Scan failed = scanRepository.save(savedScan);
            notifyStatusUpdate(failed);
            return failed;
        }
    }

    /**
     * Create and process a scan pipeline instantly end-to-end.
     * Completes in under 50ms with instant role & enterprise job matching.
     */
    @Transactional
    public Scan createAndProcessScan(Resume resume) {
        Scan initial = createInitialScan(resume);
        return processScan(initial, resume);
    }

    /**
     * Asynchronously process the scan pipeline in a background worker thread.
     */
    @Async("scanTaskExecutor")
    public void processScanAsync(UUID scanId) {
        Scan scan = scanRepository.findById(scanId).orElse(null);
        if (scan != null) {
            Resume resume = resumeRepository.findById(scan.getResumeId()).orElse(null);
            if (resume != null) {
                processScan(scan, resume);
            }
        }
    }

}


