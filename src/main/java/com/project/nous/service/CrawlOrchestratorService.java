package com.project.nous.service;

import com.project.nous.domain.Company;
import com.project.nous.domain.CrawlResult;
import com.project.nous.domain.CrawlRun;
import com.project.nous.domain.JobPosting;
import com.project.nous.repository.CompanyRepository;
import com.project.nous.repository.CrawlResultRepository;
import com.project.nous.repository.CrawlRunRepository;
import com.project.nous.repository.JobPostingRepository;
import com.project.nous.service.adapter.CareerPageAdapter;
import com.project.nous.service.adapter.RawJobPosting;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.*;

/**
 * Core Orchestrator Service for Top-500 Enterprise Daily Screening.
 * Handles seeding, multi-threaded parallel crawling, SHA-256 deduplication,
 * soft expiration of closed postings, and scheduled execution at 12:00 PM daily.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CrawlOrchestratorService {

    private final CompanyRepository companyRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CrawlRunRepository crawlRunRepository;
    private final CrawlResultRepository crawlResultRepository;
    private final List<CareerPageAdapter> adapters;

    private final ExecutorService executor = Executors.newFixedThreadPool(50);
    private boolean isCrawlInProgress = false;

    @PostConstruct
    public void seedInitialTop500Companies() {
        CompletableFuture.runAsync(() -> {
            try {
                long count = companyRepository.count();
                if (count < 500) {
                    log.info("🌱 Seeding Top 500 Enterprise Hiring Companies directory...");
                    List<Company> all500 = Top500CompanyDirectorySeed.getTop500Companies();
                    Set<String> existingNames = companyRepository.findAll().stream()
                            .map(c -> c.getName().toLowerCase())
                            .collect(Collectors.toSet());
                    List<Company> newCompanies = all500.stream()
                            .filter(c -> !existingNames.contains(c.getName().toLowerCase()))
                            .collect(Collectors.toList());
                    if (!newCompanies.isEmpty()) {
                        companyRepository.saveAll(newCompanies);
                    }
                    log.info("✅ Successfully seeded Top 500 Enterprise Companies.");
                }
            } catch (Exception e) {
                log.warn("Directory seeding background notice: {}", e.getMessage());
            }
        });
    }

    /**
     * Daily Scheduled Trigger: Runs everyday at 12:00 PM (Noon).
     * Cron: 0 0 12 * * *
     */
    @Scheduled(cron = "0 0 12 * * *")
    public void runDailyScheduledCrawl() {
        log.info("⏰ [12:00 PM DAILY TRIGGER] Starting automated Top-500 Company Screening...");
        runFullCrawlBatch();
    }

    /**
     * Executes a full crawl batch across all active enterprise companies.
     */
    public synchronized CrawlRun runFullCrawlBatch() {
        if (isCrawlInProgress) {
            log.warn("Crawl run is already in progress. Skipping duplicate execution.");
            return crawlRunRepository.findTopByOrderByStartedAtDesc().orElse(null);
        }

        isCrawlInProgress = true;
        LocalDateTime startedAt = LocalDateTime.now();
        List<Company> activeCompanies = companyRepository.findByIsActiveTrue();

        CrawlRun crawlRun = CrawlRun.builder()
                .startedAt(startedAt)
                .companiesAttempted(activeCompanies.size())
                .companiesSucceeded(0)
                .companiesPartial(0)
                .companiesFailed(0)
                .totalPostingsFound(0)
                .build();
        crawlRun = crawlRunRepository.save(crawlRun);

        log.info("🚀 Starting CrawlRun batch ID: {} across {} companies...", crawlRun.getId(), activeCompanies.size());

        int succeededCount = 0;
        int failedCount = 0;
        int totalFound = 0;

        List<Future<CompanyCrawlTaskResult>> futures = new ArrayList<>();

        for (Company company : activeCompanies) {
            final CrawlRun finalRun = crawlRun;
            futures.add(executor.submit(() -> processCompanyCrawl(company, finalRun)));
        }

        for (Future<CompanyCrawlTaskResult> future : futures) {
            try {
                CompanyCrawlTaskResult res = future.get(5, TimeUnit.SECONDS);
                if ("SUCCESS".equals(res.status)) {
                    succeededCount++;
                    totalFound += res.postingsFound;
                } else {
                    failedCount++;
                }
            } catch (Exception e) {
                failedCount++;
                log.error("Company crawl task execution failed or timed out: {}", e.getMessage());
            }
        }

        crawlRun.setCompletedAt(LocalDateTime.now());
        crawlRun.setCompaniesSucceeded(succeededCount);
        crawlRun.setCompaniesFailed(failedCount);
        crawlRun.setTotalPostingsFound(totalFound);
        crawlRun = crawlRunRepository.save(crawlRun);

        isCrawlInProgress = false;
        log.info("🏁 Finished CrawlRun batch ID: {}. Succeeded: {}, Failed: {}, Total Postings: {}",
                crawlRun.getId(), succeededCount, failedCount, totalFound);

        return crawlRun;
    }

    private CompanyCrawlTaskResult processCompanyCrawl(Company company, CrawlRun crawlRun) {
        long startTime = System.currentTimeMillis();
        log.debug("Processing crawl for company: {}", company.getName());

        CareerPageAdapter selectedAdapter = adapters.stream()
                .filter(a -> a.supports(company))
                .findFirst()
                .orElse(null);

        if (selectedAdapter == null) {
            String err = "No matching adapter found for adapterType: " + company.getAdapterType();
            saveCrawlResult(crawlRun, company, "FAILED", 0, err, System.currentTimeMillis() - startTime);
            return new CompanyCrawlTaskResult("FAILED", 0);
        }

        try {
            List<RawJobPosting> rawList = selectedAdapter.fetchOpenings(company);
            Set<String> seenHashesInRun = new HashSet<>();

            for (RawJobPosting raw : rawList) {
                String hash = computeSha256(company.getId() + ":" + raw.getTitle() + ":" + raw.getApplyUrl());
                seenHashesInRun.add(hash);

                Optional<JobPosting> existingOpt = jobPostingRepository.findByPostingHash(hash);
                if (existingOpt.isPresent()) {
                    JobPosting jp = existingOpt.get();
                    jp.setLastSeenAt(LocalDateTime.now());
                    jp.setIsCurrentlyOpen(true);
                    jobPostingRepository.save(jp);
                } else {
                    JobPosting newJp = JobPosting.builder()
                            .company(company)
                            .externalId(raw.getExternalId())
                            .title(raw.getTitle())
                            .location(raw.getLocation())
                            .department(raw.getDepartment())
                            .applyUrl(raw.getApplyUrl())
                            .postingHash(hash)
                            .firstSeenAt(LocalDateTime.now())
                            .lastSeenAt(LocalDateTime.now())
                            .isCurrentlyOpen(true)
                            .salaryRange(raw.getSalaryRange() != null ? raw.getSalaryRange() : "Competitive Salary")
                            .build();
                    jobPostingRepository.save(newJp);
                }
            }

            // Soft-expire positions not seen in this run
            List<JobPosting> existingOpenings = jobPostingRepository.findByCompanyIdAndIsCurrentlyOpenTrue(company.getId());
            for (JobPosting openJp : existingOpenings) {
                if (!seenHashesInRun.contains(openJp.getPostingHash())) {
                    openJp.setIsCurrentlyOpen(false);
                    jobPostingRepository.save(openJp);
                }
            }

            company.setLastCrawledAt(LocalDateTime.now());
            company.setLastCrawlStatus("SUCCESS");
            companyRepository.save(company);

            saveCrawlResult(crawlRun, company, "SUCCESS", rawList.size(), null, System.currentTimeMillis() - startTime);
            return new CompanyCrawlTaskResult("SUCCESS", rawList.size());

        } catch (Exception e) {
            log.error("Error crawling company {}: {}", company.getName(), e.getMessage());
            company.setLastCrawledAt(LocalDateTime.now());
            company.setLastCrawlStatus("FAILED");
            companyRepository.save(company);

            saveCrawlResult(crawlRun, company, "FAILED", 0, e.getMessage(), System.currentTimeMillis() - startTime);
            return new CompanyCrawlTaskResult("FAILED", 0);
        }
    }

    private void saveCrawlResult(CrawlRun crawlRun, Company company, String status, int postingsFound, String errorReason, long durationMs) {
        CrawlResult result = CrawlResult.builder()
                .crawlRun(crawlRun)
                .company(company)
                .status(status)
                .postingsFound(postingsFound)
                .errorReason(errorReason)
                .durationMs(durationMs)
                .build();
        crawlResultRepository.save(result);
    }

    private String computeSha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return String.valueOf(input.hashCode());
        }
    }

    private static class CompanyCrawlTaskResult {
        String status;
        int postingsFound;
        CompanyCrawlTaskResult(String status, int postingsFound) {
            this.status = status;
            this.postingsFound = postingsFound;
        }
    }
}
