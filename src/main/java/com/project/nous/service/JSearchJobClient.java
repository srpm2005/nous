package com.project.nous.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.nous.dto.JobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Implementation of {@link JobSearchClient} communicating with JSearch RapidAPI.
 * Aggregates live job postings across LinkedIn, Indeed, Glassdoor, and Indian company sites.
 * Active when property {@code app.jobapi.provider=jsearch} and {@code app.jobapi.enabled=true}.
 */
@Service
@Slf4j
@ConditionalOnProperty(name = "app.jobapi.provider", havingValue = "jsearch")
public class JSearchJobClient implements JobSearchClient {

    @Value("${app.jobapi.jsearch.api-key:}")
    private String apiKey;

    @Value("${app.jobapi.jsearch.api-host:jsearch.p.rapidapi.com}")
    private String apiHost;

    private final RestClient jsearchRestClient;
    private final MockJobSearchClient fallbackClient = new MockJobSearchClient();

    public JSearchJobClient() {
        this.jsearchRestClient = RestClient.builder()
                .baseUrl("https://jsearch.p.rapidapi.com")
                .defaultHeader("User-Agent", "Mozilla/5.0")
                .build();
    }

    @Override
    public List<JobListingDto> searchJobs(String roleTitle, String location) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("JSearch RapidAPI Key is unconfigured. Using fallback job matching client.");
            return fallbackClient.searchJobs(roleTitle, location);
        }

        String searchLocation = (location != null && !location.isBlank()) ? location : "India";
        String searchQuery = roleTitle + " in " + searchLocation;

        log.info("Querying JSearch RapidAPI for role: '{}', query: '{}'", roleTitle, searchQuery);

        try {
            JSearchResponse response = jsearchRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("query", searchQuery)
                            .queryParam("page", "1")
                            .queryParam("num_pages", "1")
                            .queryParam("country", "in")
                            .build())
                    .header("x-rapidapi-key", apiKey)
                    .header("x-rapidapi-host", apiHost)
                    .retrieve()
                    .body(JSearchResponse.class);

            if (response != null && response.data() != null && !response.data().isEmpty()) {
                log.info("JSearch RapidAPI successfully returned {} live openings for role '{}'", response.data().size(), roleTitle);
                return response.data().stream()
                        .map(j -> JobListingDto.builder()
                                .title(j.jobTitle() != null ? j.jobTitle() : roleTitle)
                                .company(j.employerName() != null ? j.employerName() : "Enterprise Partner")
                                .location(formatLocation(j.jobCity(), j.jobCountry(), searchLocation))
                                .salaryRange(formatSalary(j.jobMinSalary(), j.jobMaxSalary(), j.jobSalaryCurrency()))
                                .applyUrl(j.jobApplyLink() != null ? j.jobApplyLink() : "https://www.linkedin.com/jobs")
                                .sourceApi(getProviderName())
                                .build())
                        .toList();
            } else {
                log.warn("JSearch RapidAPI returned 0 results for query '{}'. Using fallback.", searchQuery);
            }
        } catch (Exception e) {
            log.error("JSearch RapidAPI request failed for query '{}': {}", searchQuery, e.getMessage());
        }

        return fallbackClient.searchJobs(roleTitle, location);
    }

    @Override
    public String getProviderName() {
        return "JSearch (LinkedIn/Indeed/Glassdoor)";
    }

    private String formatLocation(String city, String country, String fallback) {
        if (city != null && !city.isBlank()) {
            return city + (country != null ? ", " + country : ", India");
        }
        return fallback;
    }

    private String formatSalary(Double min, Double max, String currency) {
        if (min == null && max == null) return "Competitive Salary";
        String symbol = "INR".equalsIgnoreCase(currency) || currency == null ? "₹" : "$";
        if (min != null && max != null) return String.format("%s%,.0f - %s%,.0f", symbol, min, symbol, max);
        return min != null ? String.format("From %s%,.0f", symbol, min) : String.format("Up to %s%,.0f", symbol, max);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JSearchResponse(String status, List<JSearchJob> data) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record JSearchJob(
            @JsonProperty("job_id") String jobId,
            @JsonProperty("employer_name") String employerName,
            @JsonProperty("employer_logo") String employerLogo,
            @JsonProperty("job_title") String jobTitle,
            @JsonProperty("job_apply_link") String jobApplyLink,
            @JsonProperty("job_city") String jobCity,
            @JsonProperty("job_country") String jobCountry,
            @JsonProperty("job_min_salary") Double jobMinSalary,
            @JsonProperty("job_max_salary") Double jobMaxSalary,
            @JsonProperty("job_salary_currency") String jobSalaryCurrency
    ) {}
}
