package com.project.nous.repository;

import com.project.nous.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    boolean existsByName(String name);
    List<Company> findByIsActiveTrue();
    Optional<Company> findByDomain(String domain);
    Optional<Company> findByNameIgnoreCase(String name);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM Company c WHERE LOWER(c.name) NOT IN :verifiedNames")
    void deleteUnverifiedCompanies(@org.springframework.data.repository.query.Param("verifiedNames") java.util.Collection<String> verifiedNames);
}
