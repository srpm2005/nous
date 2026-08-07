package com.project.nous.service;

import com.project.nous.dto.JobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

/**
 * Implementation of {@link JobSearchClient} communicating with the external Adzuna Job Search API.
 * Active when property {@code app.jobapi.enabled=true}.
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "app.jobapi.enabled", havingValue = "true")
public class AdzunaJobClient implements JobSearchClient {

    private final RestClient jobApiRestClient;

    @Value("${app.jobapi.app-id:}")
    private String appId;

    @Value("${app.jobapi.app-key:}")
    private String appKey;

    public AdzunaJobClient(@Qualifier("jobApiRestClient") RestClient jobApiRestClient) {
        this.jobApiRestClient = jobApiRestClient;
    }

    @Override
    public List<JobListingDto> searchJobs(String roleTitle, String location) {
        if (roleTitle == null || roleTitle.trim().isEmpty()) {
            log.warn("Job search invoked with blank role title. Returning empty results.");
            return Collections.emptyList();
        }

        String searchLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : "remote";
        log.info("Querying Adzuna Job Search API for role: '{}', location: '{}'", roleTitle, searchLocation);

        try {
            AdzunaResponse response = jobApiRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/us/search/1")
                            .queryParam("app_id", appId)
                            .queryParam("app_key", appKey)
                            .queryParam("what", roleTitle)
                            .queryParam("where", searchLocation)
                            .queryParam("results_per_page", 5)
                            .build())
                    .retrieve()
                    .body(AdzunaResponse.class);

            if (response == null || response.results() == null || response.results().isEmpty()) {
                log.info("Adzuna Job API returned 0 listings for role: '{}'", roleTitle);
                return Collections.emptyList();
            }

            return response.results().stream()
                    .map(r -> JobListingDto.builder()
                            .title(r.title() != null ? r.title() : roleTitle)
                            .company(r.company() != null && r.company().displayName() != null 
                                    ? r.company().displayName() : "Technology Company")
                            .location(r.location() != null && r.location().displayName() != null 
                                    ? r.location().displayName() : searchLocation)
                            .salaryRange(formatSalary(r.salaryMin(), r.salaryMax()))
                            .applyUrl(r.redirectUrl() != null ? r.redirectUrl() : "https://www.adzuna.com")
                            .sourceApi(getProviderName())
                            .build())
                    .toList();

        } catch (Exception e) {
            log.error("Failed to fetch job listings from Adzuna API for role '{}': {}", roleTitle, e.getMessage());
            return Collections.emptyList();
        }
    }

    @Override
    public String getProviderName() {
        return "Adzuna";
    }

    private String formatSalary(Double min, Double max) {
        if (min == null && max == null) return "Competitive Salary";
        if (min != null && max != null) return String.format("$%,.0f - $%,.0f", min, max);
        return min != null ? String.format("From $%,.0f", min) : String.format("Up to $%,.0f", max);
    }

    // Inner Records for Jackson deserialization of Adzuna JSON payload
    public record AdzunaResponse(List<AdzunaResult> results) {}
    public record AdzunaResult(String title, AdzunaCompany company, AdzunaLocation location, Double salaryMin, Double salaryMax, String redirectUrl) {}
    public record AdzunaCompany(String displayName) {}
    public record AdzunaLocation(String displayName) {}
}
