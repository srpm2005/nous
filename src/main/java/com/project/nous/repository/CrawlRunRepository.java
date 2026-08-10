package com.project.nous.repository;

import com.project.nous.domain.CrawlRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CrawlRunRepository extends JpaRepository<CrawlRun, UUID> {
    Optional<CrawlRun> findTopByOrderByStartedAtDesc();
    List<CrawlRun> findTop10ByOrderByStartedAtDesc();
}
