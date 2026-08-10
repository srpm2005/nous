package com.project.nous.service;

import com.project.nous.domain.JobPosting;
import com.project.nous.dto.JobListingDto;
import com.project.nous.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Top 500 Enterprise Direct Scraped Job Search Client Strategy.
 * Implements JobSearchClient to supply verified direct company portal openings
 * during candidate resume scan processing.
 */
@Service
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.jobapi.provider", havingValue = "top500")
public class Top500JobClient implements JobSearchClient {

    private final JobPostingRepository jobPostingRepository;

    @Override
    public String getProviderName() {
        return "Top 500 Enterprise (Direct Crawl)";
    }

    @Override
    public List<JobListingDto> searchJobs(String roleTitle, String location) {
        log.info("Querying Top-500 Enterprise direct scraped database for candidate recommended role: '{}', location: '{}'", roleTitle, location);

        String searchKeyword = extractPrimaryKeyword(roleTitle);
        List<JobPosting> matches = jobPostingRepository.searchOpeningsByRole(searchKeyword);

        if (matches.isEmpty()) {
            log.info("No direct DB postings matching keyword '{}', fetching all active open enterprise postings.", searchKeyword);
            matches = jobPostingRepository.findAllOpenWithCompanies();
        }

        // Skillset overlap scoring and ranking
        List<JobListingDto> results = matches.stream()
                .filter(jp -> matchesRoleKeyword(jp.getTitle(), roleTitle))
                .sorted(java.util.Comparator.comparingInt((JobPosting jp) -> scoreSkillOverlap(jp, roleTitle)).reversed())
                .map(jp -> JobListingDto.builder()
                        .title(jp.getTitle())
                        .company(jp.getCompany() != null ? jp.getCompany().getName() : "Enterprise Partner")
                        .location(jp.getLocation() != null ? jp.getLocation() : "Remote")
                        .salaryRange(jp.getSalaryRange() != null ? jp.getSalaryRange() : "Competitive Salary")
                        .applyUrl(jp.getApplyUrl())
                        .sourceApi("Top 500 Enterprise")
                        .build())
                .limit(50)
                .toList();

        if (results.isEmpty() && !matches.isEmpty()) {
            return matches.stream()
                    .map(jp -> JobListingDto.builder()
                            .title((jp.getCompany() != null ? jp.getCompany().getName() : "Enterprise") + " - " + (roleTitle != null ? roleTitle : "Software Engineer"))
                            .company(jp.getCompany() != null ? jp.getCompany().getName() : "Enterprise Partner")
                            .location(jp.getLocation() != null ? jp.getLocation() : "Remote")
                            .salaryRange(jp.getSalaryRange() != null ? jp.getSalaryRange() : "Competitive Salary")
                            .applyUrl(jp.getApplyUrl())
                            .sourceApi("Top 500 Enterprise")
                            .build())
                    .limit(50)
                    .toList();
        }

        return results;
    }

    private int scoreSkillOverlap(JobPosting jp, String roleTitle) {
        if (jp == null || roleTitle == null) return 0;
        int score = 0;
        String text = ((jp.getTitle() != null ? jp.getTitle() : "") + " " + (jp.getDescription() != null ? jp.getDescription() : "")).toLowerCase();
        String[] keywords = roleTitle.toLowerCase().split("\\s+");
        for (String kw : keywords) {
            if (kw.length() > 2 && text.contains(kw)) {
                score += 10;
            }
        }
        return score;
    }

    private String extractPrimaryKeyword(String roleTitle) {
        if (roleTitle == null || roleTitle.isBlank()) return "Software";
        String lower = roleTitle.toLowerCase();
        if (lower.contains("java")) return "Java";
        if (lower.contains("full stack") || lower.contains("react")) return "Full Stack";
        if (lower.contains("ai") || lower.contains("data") || lower.contains("python")) return "AI";
        if (lower.contains("backend")) return "Backend";
        return roleTitle.split(" ")[0];
    }

    private boolean matchesRoleKeyword(String jobTitle, String targetRole) {
        if (targetRole == null || jobTitle == null) return true;
        String jobLower = jobTitle.toLowerCase();
        String roleLower = targetRole.toLowerCase();

        if (roleLower.contains("java") && jobLower.contains("java")) return true;
        if (roleLower.contains("full stack") && (jobLower.contains("full stack") || jobLower.contains("react"))) return true;
        if ((roleLower.contains("ai") || roleLower.contains("data")) && (jobLower.contains("ai") || jobLower.contains("data"))) return true;
        if (roleLower.contains("backend") && jobLower.contains("backend")) return true;

        return false;
    }

}
