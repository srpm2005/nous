package com.project.nous.service;

import com.project.nous.dto.JobListingDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link AdzunaJobClient}.
 */
class AdzunaJobClientTest {

    private AdzunaJobClient client;

    @BeforeEach
    void setUp() {
        RestClient restClient = RestClient.builder().build();
        client = new AdzunaJobClient(restClient);

        ReflectionTestUtils.setField(client, "appId", "test-app-id");
        ReflectionTestUtils.setField(client, "appKey", "test-app-key");
    }

    @Test
    @DisplayName("Null or blank role title returns empty list safely")
    void searchJobs_nullOrBlankRole_returnsEmptyList() {
        List<JobListingDto> resultNull = client.searchJobs(null, "remote");
        List<JobListingDto> resultBlank = client.searchJobs("   ", "remote");

        assertThat(resultNull).isEmpty();
        assertThat(resultBlank).isEmpty();
    }

    @Test
    @DisplayName("Provider name returns 'Adzuna'")
    void getProviderName_returnsAdzuna() {
        assertThat(client.getProviderName()).isEqualTo("Adzuna");
    }

    @Test
    @DisplayName("Unreachable base URL catches exception and returns empty list without throwing")
    void searchJobs_unreachableEndpoint_catchesExceptionAndReturnsEmptyList() {
        List<JobListingDto> results = client.searchJobs("Backend Engineer", "San Francisco");

        assertThat(results).isNotNull();
        assertThat(results).isEmpty();
    }
}
