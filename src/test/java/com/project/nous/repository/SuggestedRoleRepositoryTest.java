package com.project.nous.repository;

import com.project.nous.domain.SuggestedRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("dev")
class SuggestedRoleRepositoryTest {

    @Autowired
    private SuggestedRoleRepository suggestedRoleRepository;

    @Test
    @DisplayName("Should save suggested roles and retrieve them ordered by rank ascending")
    void saveAndFindByScanIdOrderedByRank() {
        UUID scanId = UUID.randomUUID();

        SuggestedRole role2 = SuggestedRole.builder()
                .scanId(scanId)
                .roleTitle("Full Stack Software Engineer")
                .rankOrder(2)
                .confidenceScore(0.88)
                .matchReason("React and Node.js skills detected.")
                .keySkillsCsv("React,JavaScript,HTML,CSS")
                .build();

        SuggestedRole role1 = SuggestedRole.builder()
                .scanId(scanId)
                .roleTitle("Senior Java Engineer")
                .rankOrder(1)
                .confidenceScore(0.95)
                .matchReason("Strong backend Java Spring Boot experience.")
                .keySkillsCsv("Java,Spring Boot,PostgreSQL,REST")
                .build();

        suggestedRoleRepository.save(role2);
        suggestedRoleRepository.save(role1);

        List<SuggestedRole> results = suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(scanId);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getRoleTitle()).isEqualTo("Senior Java Engineer");
        assertThat(results.get(0).getRankOrder()).isEqualTo(1);
        assertThat(results.get(1).getRoleTitle()).isEqualTo("Full Stack Software Engineer");
        assertThat(results.get(1).getRankOrder()).isEqualTo(2);
    }

    @Test
    @DisplayName("Should delete all suggested roles for a given scan ID")
    void deleteByScanId() {
        UUID scanId = UUID.randomUUID();
        SuggestedRole role = SuggestedRole.builder()
                .scanId(scanId)
                .roleTitle("DevOps Engineer")
                .rankOrder(1)
                .confidenceScore(0.82)
                .build();

        suggestedRoleRepository.save(role);
        assertThat(suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(scanId)).hasSize(1);

        suggestedRoleRepository.deleteByScanId(scanId);

        assertThat(suggestedRoleRepository.findByScanIdOrderByRankOrderAsc(scanId)).isEmpty();
    }
}
