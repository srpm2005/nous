package com.project.nous.controller;

import com.project.nous.domain.JobListing;
import com.project.nous.service.ScanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ScanController.class)
class ScanControllerJobTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    void getJobListingsByScanId_returnsJobListings() throws Exception {
        UUID scanId = UUID.randomUUID();
        UUID roleId = UUID.randomUUID();

        JobListing job = JobListing.builder()
                .id(UUID.randomUUID())
                .scanId(scanId)
                .roleId(roleId)
                .title("Senior Java Developer")
                .company("Acme Corp")
                .location("Remote")
                .salaryRange("$130,000 - $160,000")
                .applyUrl("https://example.com/apply")
                .sourceApi("Adzuna")
                .build();

        given(scanService.getJobListingsByScanId(scanId)).willReturn(List.of(job));

        mockMvc.perform(get("/api/scans/{scanId}/jobs", scanId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Senior Java Developer"))
                .andExpect(jsonPath("$[0].company").value("Acme Corp"))
                .andExpect(jsonPath("$[0].sourceApi").value("Adzuna"));
    }

    @Test
    void getJobListingsByResumeId_returnsJobListings() throws Exception {
        UUID resumeId = UUID.randomUUID();
        UUID scanId = UUID.randomUUID();

        JobListing job = JobListing.builder()
                .id(UUID.randomUUID())
                .scanId(scanId)
                .roleId(UUID.randomUUID())
                .title("Lead Frontend Architect")
                .company("Tech Labs")
                .location("San Francisco, CA")
                .salaryRange("$160,000 - $190,000")
                .applyUrl("https://example.com/apply/2")
                .sourceApi("MockJobEngine")
                .build();

        given(scanService.getJobListingsByResumeId(resumeId)).willReturn(List.of(job));

        mockMvc.perform(get("/api/scans/resume/{resumeId}/jobs", resumeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Lead Frontend Architect"))
                .andExpect(jsonPath("$[0].company").value("Tech Labs"))
                .andExpect(jsonPath("$[0].sourceApi").value("MockJobEngine"));
    }
}
