package com.project.nous.controller;

import com.project.nous.domain.Resume;
import com.project.nous.exception.InvalidFileException;
import com.project.nous.service.ResumeService;
import com.project.nous.service.UploadResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * {@code @WebMvcTest} slice tests for {@link ResumeController}.
 *
 * <p>The service layer is mocked — these tests validate HTTP behaviour only:
 * correct status codes, Content-Type headers, and error response shapes.
 */
@WebMvcTest(ResumeController.class)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ResumeService resumeService;

    // ─── Upload happy path ────────────────────────────────────────────────────

    @Test
    void uploadValidPdf_returns201WithJson() throws Exception {
        Resume fakeResume = buildFakeResume("resume.pdf", "application/pdf",
                "John Doe Software Engineer");

        given(resumeService.upload(any(), anyString()))
                .willReturn(new UploadResult(fakeResume, false));

        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf",
                "fake-pdf-bytes".getBytes());

        mockMvc.perform(multipart("/api/resumes").file(file))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.originalFilename").value("resume.pdf"))
                .andExpect(jsonPath("$.mimeType").value("application/pdf"))
                .andExpect(jsonPath("$.extractedCharCount").isNumber());
    }

    // ─── Upload error cases ───────────────────────────────────────────────────

    @Test
    void uploadWithNoFile_returns400() throws Exception {
        mockMvc.perform(multipart("/api/resumes"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void uploadInvalidMime_returns400WithProblemDetail() throws Exception {
        given(resumeService.upload(any(), anyString()))
                .willThrow(new InvalidFileException(
                        "File type 'image/jpeg' is not supported. Only PDF and DOCX files are accepted."));

        MockMultipartFile file = new MockMultipartFile(
                "file", "photo.pdf", "image/jpeg", new byte[]{(byte) 0xFF, (byte) 0xD8});

        mockMvc.perform(multipart("/api/resumes").file(file))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        org.hamcrest.Matchers.containsString("not supported")));
    }

    @Test
    void uploadEmptyFile_returns400() throws Exception {
        given(resumeService.upload(any(), anyString()))
                .willThrow(new InvalidFileException("No file provided or file is empty."));

        MockMultipartFile empty = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        mockMvc.perform(multipart("/api/resumes").file(empty))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        org.hamcrest.Matchers.containsString("empty")));
    }

    // ─── GET by ID ────────────────────────────────────────────────────────────

    @Test
    void getById_existingId_returns200() throws Exception {
        Resume fakeResume = buildFakeResume("resume.pdf", "application/pdf", "Some content");
        given(resumeService.findById(fakeResume.getId())).willReturn(fakeResume);

        mockMvc.perform(get("/api/resumes/{id}", fakeResume.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(fakeResume.getId().toString()));
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────

    @Test
    void delete_existingId_returns204() throws Exception {
        UUID id = UUID.randomUUID();
        willDoNothing().given(resumeService).delete(id);

        mockMvc.perform(delete("/api/resumes/{id}", id))
                .andExpect(status().isNoContent());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private Resume buildFakeResume(String filename, String mimeType, String text) {
        return Resume.builder()
                .id(UUID.randomUUID())
                .userId("anonymous")
                .originalFilename(filename)
                .storedFilePath("/uploads/" + filename)
                .mimeType(mimeType)
                .fileHash("abc123")
                .extractedText(text)
                .uploadedAt(Instant.now())
                .build();
    }
}
