package com.project.nous.repository;

import com.project.nous.domain.CrawlResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CrawlResultRepository extends JpaRepository<CrawlResult, UUID> {
    List<CrawlResult> findByCrawlRunId(UUID crawlRunId);
}
