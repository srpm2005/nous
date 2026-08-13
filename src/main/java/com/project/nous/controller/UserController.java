package com.project.nous.controller;

import com.project.nous.domain.Scan;
import com.project.nous.dto.ScanResponseDto;
import com.project.nous.service.ScanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for User profile and Phase 5 scan history operations.
 *
 * <h3>Phase 5 Endpoint:</h3>
 * <ul>
 *   <li>{@code GET /api/users/{userId}/scans} — fetch full scan history across all uploaded resumes for a user.</li>
 * </ul>
 */
@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final ScanService scanService;

    /**
     * Phase 5: Fetch scan history submitted by a user ID.
     * GET /api/users/{userId}/scans
     */
    @GetMapping("/{userId}/scans")
    public ResponseEntity<List<ScanResponseDto>> getUserScans(@PathVariable String userId) {
        log.info("GET /api/users/{}/scans", userId);
        List<ScanResponseDto> dtos = scanService.getEnrichedScanResponsesByUserId(userId);
        if (dtos == null || dtos.isEmpty()) {
            List<Scan> rawScans = scanService.getScansByUserId(userId);
            if (rawScans != null && !rawScans.isEmpty()) {
                dtos = rawScans.stream().map(ScanResponseDto::from).collect(Collectors.toList());
            }
        }
        return ResponseEntity.ok(dtos != null ? dtos : List.of());
    }
}
