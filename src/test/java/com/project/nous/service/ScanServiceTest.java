package com.project.nous.service;

import com.project.nous.domain.Resume;
import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.domain.SuggestedRole;
import com.project.nous.repository.ResumeRepository;
import com.project.nous.repository.ScanRepository;
import com.project.nous.repository.SuggestedRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.FluentQuery;

import java.util.*;
import java.util.function.Function;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.project.nous.repository.JobListingRepository;

class ScanServiceTest {

    private InMemoryScanRepository scanRepository;
    private ResumeRepository resumeRepository;
    private LlmRoleExtractionService llmRoleExtractionService;
    private SuggestedRoleRepository suggestedRoleRepository;
    private JobSearchClient jobSearchClient;
    private JobListingRepository jobListingRepository;
    private ScanService scanService;

    private UUID resumeId;
    private UUID scanId;
    private Scan testScan;

    @BeforeEach
    void setUp() {
        scanRepository = new InMemoryScanRepository();
        resumeRepository = mock(ResumeRepository.class);
        llmRoleExtractionService = mock(LlmRoleExtractionService.class);
        suggestedRoleRepository = mock(SuggestedRoleRepository.class);
        jobSearchClient = mock(JobSearchClient.class);
        jobListingRepository = mock(JobListingRepository.class);

        scanService = new ScanService(
                scanRepository,
                resumeRepository,
                llmRoleExtractionService,
                suggestedRoleRepository,
                jobSearchClient,
                jobListingRepository
        );

        resumeId = UUID.randomUUID();
        scanId = UUID.randomUUID();
        testScan = Scan.builder()
                .id(scanId)
                .resumeId(resumeId)
                .status(ScanStatus.PENDING)
                .build();
        scanRepository.save(testScan);
    }

    @Test
    @DisplayName("Should create initial scan record with status PENDING")
    void testCreateInitialScan_Success() {
        Resume resume = Resume.builder().id(resumeId).build();

        Scan created = scanService.createInitialScan(resume);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isNotNull();
        assertThat(created.getResumeId()).isEqualTo(resumeId);
        assertThat(created.getStatus()).isEqualTo(ScanStatus.PENDING);
    }

    @Test
    @DisplayName("Should fetch scan by ID successfully")
    void testGetScanById_Success() {
        Scan found = scanService.getScanById(scanId);

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(scanId);
    }

    @Test
    @DisplayName("Should throw exception when scan ID is not found")
    void testGetScanById_NotFound() {
        UUID nonExistentId = UUID.randomUUID();

        assertThatThrownBy(() -> scanService.getScanById(nonExistentId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Scan not found with ID");
    }

    @Test
    @DisplayName("Should fetch scans by resume ID")
    void testGetScansByResumeId_Success() {
        List<Scan> scans = scanService.getScansByResumeId(resumeId);

        assertThat(scans).hasSize(1);
        assertThat(scans.get(0).getResumeId()).isEqualTo(resumeId);
    }

    @Test
    @DisplayName("Should process scan asynchronously and transition state to COMPLETE")
    void testProcessScanAsync_Success() {
        scanService.processScanAsync(scanId);

        Scan processed = scanRepository.findById(scanId).orElseThrow();
        assertThat(processed.getStatus()).isEqualTo(ScanStatus.COMPLETE);
        assertThat(processed.getCompletedAt()).isNotNull();
    }

    // ─── In-Memory Stub for ScanRepository ────────────────────────────────────

    private static class InMemoryScanRepository implements ScanRepository {
        private final Map<UUID, Scan> db = new HashMap<>();

        @Override
        public <S extends Scan> S save(S entity) {
            if (entity.getId() == null) {
                entity.setId(UUID.randomUUID());
            }
            db.put(entity.getId(), entity);
            return entity;
        }

        @Override
        public Optional<Scan> findById(UUID id) {
            return Optional.ofNullable(db.get(id));
        }

        @Override
        public List<Scan> findByResumeId(UUID resumeId) {
            return db.values().stream()
                    .filter(s -> resumeId.equals(s.getResumeId()))
                    .toList();
        }

        @Override
        public List<Scan> findByStatus(ScanStatus status) {
            return db.values().stream()
                    .filter(s -> status == s.getStatus())
                    .toList();
        }

        // Unused Spring Data JPA methods
        @Override public List<Scan> findAll() { return new ArrayList<>(db.values()); }
        @Override public List<Scan> findAllById(Iterable<UUID> ids) { return List.of(); }
        @Override public long count() { return db.size(); }
        @Override public void deleteById(UUID id) { db.remove(id); }
        @Override public void delete(Scan entity) { if (entity.getId() != null) db.remove(entity.getId()); }
        @Override public void deleteAllById(Iterable<? extends UUID> ids) {}
        @Override public void deleteAll(Iterable<? extends Scan> entities) {}
        @Override public void deleteAll() { db.clear(); }
        @Override public boolean existsById(UUID id) { return db.containsKey(id); }
        @Override public <S extends Scan> List<S> saveAll(Iterable<S> entities) { return List.of(); }
        @Override public void flush() {}
        @Override public <S extends Scan> S saveAndFlush(S entity) { return save(entity); }
        @Override public <S extends Scan> List<S> saveAllAndFlush(Iterable<S> entities) { return List.of(); }
        @Override public void deleteAllInBatch(Iterable<Scan> entities) {}
        @Override public void deleteAllByIdInBatch(Iterable<UUID> ids) {}
        @Override public void deleteAllInBatch() {}
        @Override @SuppressWarnings("deprecation") public Scan getOne(UUID id) { return db.get(id); }
        @Override @SuppressWarnings("deprecation") public Scan getById(UUID id) { return db.get(id); }
        @Override public Scan getReferenceById(UUID id) { return db.get(id); }
        @Override public <S extends Scan> Optional<S> findOne(Example<S> example) { return Optional.empty(); }
        @Override public <S extends Scan> List<S> findAll(Example<S> example) { return List.of(); }
        @Override public <S extends Scan> List<S> findAll(Example<S> example, Sort sort) { return List.of(); }
        @Override public <S extends Scan> Page<S> findAll(Example<S> example, Pageable pageable) { return Page.empty(); }
        @Override public <S extends Scan> long count(Example<S> example) { return 0; }
        @Override public <S extends Scan> boolean exists(Example<S> example) { return false; }
        @Override public <S extends Scan, R> R findBy(Example<S> example, Function<FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
        @Override public List<Scan> findAll(Sort sort) { return List.of(); }
        @Override public Page<Scan> findAll(Pageable pageable) { return Page.empty(); }
    }
}
