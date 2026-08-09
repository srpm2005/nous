package com.project.nous.repository;

import com.project.nous.domain.Resume;
import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class ScanRepositoryTest {

    @Autowired
    private ScanRepository scanRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Test
    @DisplayName("Should save and retrieve a Scan record with default PENDING status and createdAt timestamp")
    void saveAndFindScan() {
        UUID resumeId = UUID.randomUUID();
        Scan scan = Scan.builder()
                .resumeId(resumeId)
                .build();

        Scan savedScan = scanRepository.save(scan);

        assertThat(savedScan.getId()).isNotNull();
        assertThat(savedScan.getResumeId()).isEqualTo(resumeId);
        assertThat(savedScan.getStatus()).isEqualTo(ScanStatus.PENDING);
        assertThat(savedScan.getCreatedAt()).isNotNull();
        assertThat(savedScan.getCompletedAt()).isNull();
    }

    @Test
    @DisplayName("Should update scan status to COMPLETE with completedAt timestamp")
    void updateScanStatus() {
        UUID resumeId = UUID.randomUUID();
        Scan scan = scanRepository.save(Scan.builder()
                .resumeId(resumeId)
                .build());

        scan.setStatus(ScanStatus.COMPLETE);
        scan.setCompletedAt(Instant.now());
        scanRepository.save(scan);

        Optional<Scan> updated = scanRepository.findById(scan.getId());
        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(ScanStatus.COMPLETE);
        assertThat(updated.get().getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should query scans by resumeId and status")
    void queryByResumeIdAndStatus() {
        UUID resumeId = UUID.randomUUID();
        scanRepository.save(Scan.builder().resumeId(resumeId).status(ScanStatus.PENDING).build());
        scanRepository.save(Scan.builder().resumeId(resumeId).status(ScanStatus.COMPLETE).build());
        scanRepository.save(Scan.builder().resumeId(UUID.randomUUID()).status(ScanStatus.PENDING).build());

        List<Scan> userScans = scanRepository.findByResumeId(resumeId);
        assertThat(userScans).hasSize(2);

        List<Scan> pendingScans = scanRepository.findByStatus(ScanStatus.PENDING);
        assertThat(pendingScans).hasSize(2);
    }

    @Test
    @DisplayName("Phase 5: Should query scans by userId across multiple resumes")
    void findByUserId() {
        String userId = "test-user-123";

        Resume resume1 = resumeRepository.save(Resume.builder()
                .userId(userId)
                .originalFilename("resume1.pdf")
                .storedFilePath("/path/1.pdf")
                .mimeType("application/pdf")
                .fileHash("hash1")
                .build());

        Resume resume2 = resumeRepository.save(Resume.builder()
                .userId(userId)
                .originalFilename("resume2.pdf")
                .storedFilePath("/path/2.pdf")
                .mimeType("application/pdf")
                .fileHash("hash2")
                .build());

        scanRepository.save(Scan.builder().resumeId(resume1.getId()).status(ScanStatus.COMPLETE).build());
        scanRepository.save(Scan.builder().resumeId(resume2.getId()).status(ScanStatus.COMPLETE).build());

        List<Scan> scans = scanRepository.findByUserId(userId);
        assertThat(scans).hasSize(2);
    }

    @Test
    @DisplayName("Phase 5: Should delete scans by resumeId")
    void deleteByResumeId() {
        UUID resumeId = UUID.randomUUID();
        scanRepository.save(Scan.builder().resumeId(resumeId).status(ScanStatus.COMPLETE).build());
        scanRepository.save(Scan.builder().resumeId(resumeId).status(ScanStatus.FAILED).build());

        scanRepository.deleteByResumeId(resumeId);

        List<Scan> remaining = scanRepository.findByResumeId(resumeId);
        assertThat(remaining).isEmpty();
    }
}

