package com.project.nous.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity tracking daily automated Top 500 batch crawl executions.
 */
@Entity
@Table(name = "crawl_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrawlRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "companies_attempted")
    private Integer companiesAttempted;

    @Column(name = "companies_succeeded")
    private Integer companiesSucceeded;

    @Column(name = "companies_partial")
    private Integer companiesPartial;

    @Column(name = "companies_failed")
    private Integer companiesFailed;

    @Column(name = "total_postings_found")
    private Integer totalPostingsFound;
}
