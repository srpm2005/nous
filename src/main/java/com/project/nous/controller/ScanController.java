package com.project.nous.controller;

import com.project.nous.domain.Scan;
import com.project.nous.domain.SuggestedRole;
import com.project.nous.dto.RoleSuggestionDto;
import com.project.nous.dto.ScanResponseDto;
import com.project.nous.service.ScanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * REST controller for checking scan status and fetching AI role intelligence in Phase 2 & 3.
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

    /**
     * Fetch AI suggested target job roles for a specific scan UUID.
     * GET /api/scans/{scanId}/roles
     */
    @GetMapping("/{scanId}/roles")
    public ResponseEntity<List<RoleSuggestionDto>> getSuggestedRolesByScanId(@PathVariable UUID scanId) {
        log.info("GET /api/scans/{}/roles", scanId);
        List<SuggestedRole> roles = scanService.getSuggestedRolesByScanId(scanId);
        List<RoleSuggestionDto> dtos = roles.stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Fetch AI suggested target job roles for the latest scan of a resume UUID.
     * GET /api/scans/resume/{resumeId}/roles
     */
    @GetMapping("/resume/{resumeId}/roles")
    public ResponseEntity<List<RoleSuggestionDto>> getSuggestedRolesByResumeId(@PathVariable UUID resumeId) {
        log.info("GET /api/scans/resume/{}/roles", resumeId);
        List<SuggestedRole> roles = scanService.getSuggestedRolesByResumeId(resumeId);
        List<RoleSuggestionDto> dtos = roles.stream()
                .map(this::mapToRoleDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    private RoleSuggestionDto mapToRoleDto(SuggestedRole role) {
        List<String> skills = (role.getKeySkillsCsv() != null && !role.getKeySkillsCsv().isBlank())
                ? Arrays.stream(role.getKeySkillsCsv().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .collect(Collectors.toList())
                : List.of();

        return RoleSuggestionDto.builder()
                .roleTitle(role.getRoleTitle())
                .rank(role.getRankOrder())
                .confidenceScore(role.getConfidenceScore())
                .matchReason(role.getMatchReason())
                .keySkills(skills)
                .build();
    }
}

