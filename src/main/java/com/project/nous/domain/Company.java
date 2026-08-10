package com.project.nous.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a monitored Top 500 Enterprise company career portal.
 */
@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String domain;

    @Column(name = "career_page_url", nullable = false, length = 500)
    private String careerPageUrl;

    @Column(name = "adapter_type", nullable = false, length = 50)
    private String adapterType; // 'GREENHOUSE', 'LEVER', 'WORKDAY', 'GENERIC_HTML', 'HEADLESS'

    @Column(name = "adapter_config", length = 1000)
    private String adapterConfig; // Board token or custom URL config

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_crawled_at")
    private LocalDateTime lastCrawledAt;

    @Column(name = "last_crawl_status", length = 20)
    private String lastCrawlStatus; // 'SUCCESS', 'PARTIAL', 'FAILED', 'BLOCKED'
}
