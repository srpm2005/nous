package com.project.nous.controller;

import com.project.nous.domain.Scan;
import com.project.nous.dto.ScanResponseDto;
import com.project.nous.service.ScanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for checking scan status in Phase 2 Async Pipeline.
 */
@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/scans")
@RequiredArgsConstructor
public class ScanController {

    private final ScanService scanService;

    /**
     * Poll current status of a specific scan by UUID.
     * GET /api/scans/{scanId}
     */
    @GetMapping("/{scanId}")
    public ResponseEntity<ScanResponseDto> getScanStatus(@PathVariable UUID scanId) {
        log.info("GET /api/scans/{}", scanId);
        Scan scan = scanService.getScanById(scanId);
        return ResponseEntity.ok(ScanResponseDto.from(scan));
    }

    /**
     * Fetch all scans submitted for a given resume UUID.
     * GET /api/scans/resume/{resumeId}
     */
    @GetMapping("/resume/{resumeId}")
    public ResponseEntity<List<ScanResponseDto>> getScansByResumeId(@PathVariable UUID resumeId) {
        log.info("GET /api/scans/resume/{}", resumeId);
        List<Scan> scans = scanService.getScansByResumeId(resumeId);
        List<ScanResponseDto> dtos = scans.stream()
                .map(ScanResponseDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
