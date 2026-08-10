package com.project.nous.repository;

import com.project.nous.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {
    List<Company> findByIsActiveTrue();
    Optional<Company> findByDomain(String domain);
    Optional<Company> findByNameIgnoreCase(String name);
}
