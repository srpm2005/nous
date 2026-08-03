package com.project.nous.controller;

import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.service.ScanService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Slice tests for {@link ScanController} using {@code @WebMvcTest}.
 */
@WebMvcTest(ScanController.class)
class ScanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    void testGetScanStatus_Success() throws Exception {
        UUID scanId = UUID.randomUUID();
        UUID resumeId = UUID.randomUUID();

        Scan mockScan = Scan.builder()
                .id(scanId)
                .resumeId(resumeId)
                .status(ScanStatus.PROCESSING)
                .createdAt(Instant.now())
                .build();

        given(scanService.getScanById(scanId)).willReturn(mockScan);

        mockMvc.perform(get("/api/scans/{scanId}", scanId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scanId").value(scanId.toString()))
                .andExpect(jsonPath("$.resumeId").value(resumeId.toString()))
                .andExpect(jsonPath("$.status").value("PROCESSING"));
    }

    @Test
    void testGetScansByResumeId_Success() throws Exception {
        UUID scanId = UUID.randomUUID();
        UUID resumeId = UUID.randomUUID();

        Scan mockScan = Scan.builder()
                .id(scanId)
                .resumeId(resumeId)
                .status(ScanStatus.COMPLETE)
                .createdAt(Instant.now())
                .completedAt(Instant.now())
                .build();

        given(scanService.getScansByResumeId(resumeId)).willReturn(List.of(mockScan));

        mockMvc.perform(get("/api/scans/resume/{resumeId}", resumeId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scanId").value(scanId.toString()))
                .andExpect(jsonPath("$[0].resumeId").value(resumeId.toString()))
                .andExpect(jsonPath("$[0].status").value("COMPLETE"));
    }
}
