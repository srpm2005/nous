package com.project.nous.controller;

import com.project.nous.domain.Company;
import com.project.nous.domain.CrawlRun;
import com.project.nous.domain.JobPosting;
import com.project.nous.repository.CompanyRepository;
import com.project.nous.repository.CrawlRunRepository;
import com.project.nous.repository.JobPostingRepository;
import com.project.nous.service.CrawlOrchestratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Enterprise Portal Crawler Monitoring & Administration.
 */
@RestController
@RequestMapping({"/api/crawler", "/api/enterprise"})
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class EnterpriseCrawlController {

    private final CrawlOrchestratorService crawlOrchestratorService;
    private final CompanyRepository companyRepository;
    private final JobPostingRepository jobPostingRepository;
    private final CrawlRunRepository crawlRunRepository;

    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getMonitoredCompanies() {
        log.info("GET /api/crawler/companies");
        return ResponseEntity.ok(companyRepository.findAll());
    }

    @PostMapping("/trigger")
    public ResponseEntity<CrawlRun> triggerManualCrawl() {
        log.info("POST /api/crawler/trigger - Triggering manual Enterprise Crawl Batch");
        CompletableFuture.runAsync(crawlOrchestratorService::runFullCrawlBatch);
        CrawlRun latest = crawlRunRepository.findTopByOrderByStartedAtDesc().orElse(null);
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/runs")
    public ResponseEntity<List<CrawlRun>> getCrawlRuns() {
        log.info("GET /api/crawler/runs");
        return ResponseEntity.ok(crawlRunRepository.findTop10ByOrderByStartedAtDesc());
    }

    @GetMapping("/postings")
    public ResponseEntity<List<JobPosting>> getOpenPostings(@RequestParam(value = "query", required = false) String query) {
        log.info("GET /api/crawler/postings query='{}'", query);
        if (query != null && !query.isBlank()) {
            return ResponseEntity.ok(jobPostingRepository.searchOpeningsByRole(query));
        }
        return ResponseEntity.ok(jobPostingRepository.findByIsCurrentlyOpenTrue());
    }
}
