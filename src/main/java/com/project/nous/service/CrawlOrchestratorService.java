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
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;
    private final PayEstimationService payEstimationService = new PayEstimationService();

    private final ExecutorService executor = Executors.newFixedThreadPool(50);
    private boolean isCrawlInProgress = false;

    @PostConstruct
    public void seedInitialTop500Companies() {
        CompletableFuture.runAsync(() -> {
            try {
                syncVerifiedCompanies();
                log.info("🚀 Triggering initial live crawl batch across verified enterprise portals...");
                runFullCrawlBatch();
            } catch (Exception e) {
                log.warn("Directory synchronization notice: {}", e.getMessage());
            }
        });
    }

    @Transactional
    public void syncVerifiedCompanies() {
        log.info("🌱 Synchronizing verified live enterprise companies directory...");

        List<Company> verifiedCompanies = Top500CompanyDirectorySeed.getTop500Companies();
        Set<String> verifiedNames = verifiedCompanies.stream()
                .map(c -> c.getName().toLowerCase())
                .collect(Collectors.toSet());

        // 1. Delete all unverified postings, results, and companies in cascade
        try {
            jobPostingRepository.deleteUnverifiedPostings(verifiedNames);
            crawlResultRepository.deleteUnverifiedCrawlResults(verifiedNames);
            companyRepository.deleteUnverifiedCompanies(verifiedNames);
            log.info("🧹 Cleaned up all unverified companies and stale records.");
        } catch (Exception e) {
            log.warn("Database cleanup notice: {}", e.getMessage());
        }

        // 2. Save/Update the 19 verified live companies
        for (Company v : verifiedCompanies) {
            Optional<Company> opt = companyRepository.findByNameIgnoreCase(v.getName());
            if (opt.isPresent()) {
                Company existing = opt.get();
                existing.setAdapterType(v.getAdapterType());
                existing.setAdapterConfig(v.getAdapterConfig());
                existing.setCareerPageUrl(v.getCareerPageUrl());
                existing.setIsActive(true);
                companyRepository.save(existing);
            } else {
                companyRepository.save(v);
            }
        }

        // 3. Dynamically re-estimate pay for any existing postings with stale or placeholder ranges
        try {
            List<JobPosting> allPostings = jobPostingRepository.findAllWithCompanies();
            for (JobPosting jp : allPostings) {
                String curPay = jp.getSalaryRange();
                if (curPay == null || curPay.isBlank() || curPay.contains("18,000,000") || "Competitive Salary".equalsIgnoreCase(curPay)) {
                    String dynamicPay = payEstimationService.estimateSalaryRange(
                            jp.getTitle(),
                            jp.getLocation(),
                            jp.getCompany() != null ? jp.getCompany().getName() : "Enterprise"
                    );
                    jp.setSalaryRange(dynamicPay);
                }
            }
            jobPostingRepository.saveAll(allPostings);
            log.info("💰 Dynamically estimated realistic compensation bands for {} live job postings.", allPostings.size());
        } catch (Exception ex) {
            log.warn("Notice during dynamic pay recalculation: {}", ex.getMessage());
        }

        log.info("✅ Verified live companies directory ready ({} active portals).", companyRepository.count());
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

                String salary = raw.getSalaryRange();
                if (salary == null || salary.isBlank() || "Competitive Salary".equalsIgnoreCase(salary)) {
                    salary = payEstimationService.estimateSalaryRange(raw.getTitle(), raw.getLocation(), company.getName());
                }

                Optional<JobPosting> existingOpt = jobPostingRepository.findByPostingHash(hash);
                if (existingOpt.isPresent()) {
                    JobPosting jp = existingOpt.get();
                    jp.setLastSeenAt(LocalDateTime.now());
                    jp.setIsCurrentlyOpen(true);
                    jp.setSalaryRange(salary);
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
                            .salaryRange(salary)
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
