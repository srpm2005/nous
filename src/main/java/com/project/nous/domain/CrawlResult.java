package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity tracking per-company crawl execution results during a CrawlRun batch.
 */
@Entity
@Table(name = "crawl_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawlResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crawl_run_id", nullable = false)
    private CrawlRun crawlRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(nullable = false, length = 20)
    private String status; // 'SUCCESS', 'FAILED', 'BLOCKED', 'TIMEOUT'

    @Column(name = "postings_found")
    private Integer postingsFound;

    @Column(name = "error_reason", length = 1000)
    private String errorReason;

    @Column(name = "duration_ms")
    private Long durationMs;
}
