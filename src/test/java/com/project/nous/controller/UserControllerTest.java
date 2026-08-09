package com.project.nous.controller;

import com.project.nous.domain.Scan;
import com.project.nous.domain.ScanStatus;
import com.project.nous.service.ScanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ScanService scanService;

    @Test
    @DisplayName("Phase 5: GET /api/users/{userId}/scans should return user scan history")
    void getUserScans() throws Exception {
        String userId = "test-user-456";
        UUID scanId1 = UUID.randomUUID();
        UUID scanId2 = UUID.randomUUID();
        UUID resumeId = UUID.randomUUID();

        Scan scan1 = Scan.builder()
                .id(scanId1)
                .resumeId(resumeId)
                .status(ScanStatus.COMPLETE)
                .createdAt(Instant.now())
                .completedAt(Instant.now())
                .build();

        Scan scan2 = Scan.builder()
                .id(scanId2)
                .resumeId(resumeId)
                .status(ScanStatus.PENDING)
                .createdAt(Instant.now())
                .build();

        given(scanService.getScansByUserId(userId)).willReturn(List.of(scan1, scan2));

        mockMvc.perform(get("/api/users/{userId}/scans", userId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].scanId", is(scanId1.toString())))
                .andExpect(jsonPath("$[0].status", is("COMPLETE")))
                .andExpect(jsonPath("$[1].scanId", is(scanId2.toString())))
                .andExpect(jsonPath("$[1].status", is("PENDING")));
    }
}
