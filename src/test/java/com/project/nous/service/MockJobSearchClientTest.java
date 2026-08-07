package com.project.nous.service;

import com.project.nous.dto.JobListingDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for {@link MockJobSearchClient}.
 */
class MockJobSearchClientTest {

    private MockJobSearchClient mockClient;

    @BeforeEach
    void setUp() {
        mockClient = new MockJobSearchClient();
    }

    @Test
    @DisplayName("Null or blank role title returns empty list")
    void searchJobs_nullOrBlankRole_returnsEmptyList() {
        List<JobListingDto> resultNull = mockClient.searchJobs(null, "remote");
        List<JobListingDto> resultBlank = mockClient.searchJobs("   ", "remote");

        assertThat(resultNull).isEmpty();
        assertThat(resultBlank).isEmpty();
    }

    @Test
    @DisplayName("Valid role title generates synthetic job listings with correct provider attribution")
    void searchJobs_validRoleTitle_returnsSyntheticListings() {
        String roleTitle = "Java Backend Engineer";

        List<JobListingDto> results = mockClient.searchJobs(roleTitle, "Remote");

        assertThat(results).isNotEmpty();
        assertThat(results).hasSize(3);

        JobListingDto topListing = results.get(0);
        assertThat(topListing.getTitle()).contains(roleTitle);
        assertThat(topListing.getCompany()).isNotBlank();
        assertThat(topListing.getSourceApi()).isEqualTo("MockJobEngine");
        assertThat(topListing.getApplyUrl()).startsWith("https://example.com");
    }

    @Test
    @DisplayName("Provider name returns 'MockJobEngine'")
    void getProviderName_returnsMockJobEngine() {
        assertThat(mockClient.getProviderName()).isEqualTo("MockJobEngine");
    }
}
