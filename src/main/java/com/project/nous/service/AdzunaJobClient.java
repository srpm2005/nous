package com.project.nous.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.nous.dto.JobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
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
@ConditionalOnProperty(name = "app.jobapi.provider", havingValue = "adzuna", matchIfMissing = true)
public class AdzunaJobClient implements JobSearchClient {


    private final RestClient jobApiRestClient;

    @Value("${app.jobapi.app-id:}")
    private String appId;

    @Value("${app.jobapi.app-key:}")
    private String appKey;

    @Value("${app.jobapi.country:in}")
    private String country;

    private final MockJobSearchClient mockFallbackClient = new MockJobSearchClient();

    public AdzunaJobClient(@Qualifier("jobApiRestClient") RestClient jobApiRestClient) {
        this.jobApiRestClient = jobApiRestClient;
    }

    @Override
    public List<JobListingDto> searchJobs(String roleTitle, String location) {
        if (roleTitle == null || roleTitle.trim().isEmpty()) {
            log.warn("Job search invoked with blank role title. Returning empty results.");
            return Collections.emptyList();
        }

        String searchLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : "India";
        String countryCode = (country != null && !country.isBlank()) ? country.trim().toLowerCase() : "in";
        log.info("Querying Adzuna Job Search API (country={}) for role: '{}', location: '{}'", countryCode, roleTitle, searchLocation);

        try {
            AdzunaResponse response = jobApiRestClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/" + countryCode + "/search/1")
                                .queryParam("app_id", appId)
                                .queryParam("app_key", appKey)
                                .queryParam("what", roleTitle)
                                .queryParam("results_per_page", 5);

                        if (location != null && !location.isBlank() 
                                && !"India".equalsIgnoreCase(location.trim()) 
                                && !"Remote".equalsIgnoreCase(location.trim())) {
                            builder.queryParam("where", location.trim());
                        }
                        return builder.build();
                    })
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(AdzunaResponse.class);



            if (response != null && response.results() != null && !response.results().isEmpty()) {
                log.info("Adzuna API returned {} live job openings for role '{}'", response.results().size(), roleTitle);
                return response.results().stream()
                        .map(r -> JobListingDto.builder()
                                .title(r.title() != null ? r.title().replaceAll("<[^>]*>", "").trim() : roleTitle)
                                .company(r.company() != null && r.company().displayName() != null 
                                        ? r.company().displayName().replaceAll("<[^>]*>", "").trim() : "Technology Enterprise")
                                .location(r.location() != null && r.location().displayName() != null 
                                        ? r.location().displayName().replaceAll("<[^>]*>", "").trim() : searchLocation)
                                .salaryRange(formatSalary(r.salaryMin(), r.salaryMax()))
                                .applyUrl(r.redirectUrl() != null ? r.redirectUrl() : "https://www.adzuna.in")
                                .sourceApi(getProviderName())
                                .build())
                        .toList();

            } else {
                log.warn("Adzuna API returned 0 results for role '{}' in country '{}'. Using fallback listings.", roleTitle, countryCode);
            }

        } catch (Exception e) {
            log.error("Failed to fetch live job listings from Adzuna API for role '{}': {}. Falling back to search client.", roleTitle, e.getMessage());
        }

        return mockFallbackClient.searchJobs(roleTitle, location);
    }

    @Override
    public String getProviderName() {
        return "Adzuna";
    }

    private String formatSalary(Double min, Double max) {
        if (min == null && max == null) return "Competitive Salary";
        if (min != null && max != null) return String.format("₹%,.0f - ₹%,.0f", min, max);
        return min != null ? String.format("From ₹%,.0f", min) : String.format("Up to ₹%,.0f", max);
    }

    // Inner Records for Jackson deserialization of Adzuna JSON payload
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdzunaResponse(List<AdzunaResult> results) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdzunaResult(
            String title,
            AdzunaCompany company,
            AdzunaLocation location,
            @JsonProperty("salary_min") Double salaryMin,
            @JsonProperty("salary_max") Double salaryMax,
            @JsonProperty("redirect_url") String redirectUrl
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdzunaCompany(@JsonProperty("display_name") String displayName) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AdzunaLocation(@JsonProperty("display_name") String displayName) {}
}

