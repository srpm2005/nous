package com.project.nous.repository;

import com.project.nous.domain.CrawlResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CrawlResultRepository extends JpaRepository<CrawlResult, UUID> {
    List<CrawlResult> findByCrawlRunId(UUID crawlRunId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByCompanyId(UUID companyId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM CrawlResult r WHERE LOWER(r.company.name) NOT IN :verifiedNames")
    void deleteUnverifiedCrawlResults(@org.springframework.data.repository.query.Param("verifiedNames") java.util.Collection<String> verifiedNames);
}
