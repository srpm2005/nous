package com.project.nous.service;

import com.project.nous.dto.JobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Offline heuristic fallback implementation of {@link JobSearchClient}.
 * Active when property {@code app.jobapi.enabled=false} or when unconfigured.
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "app.jobapi.enabled", havingValue = "false", matchIfMissing = true)
public class MockJobSearchClient implements JobSearchClient {

    @Override
    public List<JobListingDto> searchJobs(String roleTitle, String location) {
        if (roleTitle == null || roleTitle.trim().isEmpty()) {
            log.warn("Mock job search invoked with empty role title. Returning empty list.");
            return Collections.emptyList();
        }

        String searchLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : "Remote / Hybrid";
        log.info("Generating synthetic mock job listings for role: '{}', location: '{}'", roleTitle, searchLocation);

        return List.of(
                JobListingDto.builder()
                        .title("Senior " + roleTitle)
                        .company("TechCorp Enterprise Solutions")
                        .location(searchLocation + " (San Francisco, CA)")
                        .salaryRange("$135,000 - $165,000")
                        .applyUrl("https://example.com/careers/job-101")
                        .sourceApi(getProviderName())
                        .build(),
                JobListingDto.builder()
                        .title("Lead " + roleTitle + " Architect")
                        .company("Innovate Cloud Labs")
                        .location(searchLocation + " (New York, NY)")
                        .salaryRange("$150,000 - $185,000")
                        .applyUrl("https://example.com/careers/job-102")
                        .sourceApi(getProviderName())
                        .build(),
                JobListingDto.builder()
                        .title(roleTitle + " - Platform Team")
                        .company("Global Scale Systems")
                        .location("Remote / Austin, TX")
                        .salaryRange("$120,000 - $150,000")
                        .applyUrl("https://example.com/careers/job-103")
                        .sourceApi(getProviderName())
                        .build()
        );
    }

    @Override
    public String getProviderName() {
        return "MockJobEngine";
    }
}
