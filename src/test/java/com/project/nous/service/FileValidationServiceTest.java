package com.project.nous.service;

import com.project.nous.exception.InvalidFileException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link FileValidationService}.
 *
 * <p>All tests run without a Spring context — the service is constructed directly.
 * Magic-byte detection is done by Apache Tika on real file bytes.
 */
class FileValidationServiceTest {

    private FileValidationService service;

    // 5 MB limit, PDF + DOCX allowed
    private static final long MAX_SIZE = 5_242_880L;
    private static final String ALLOWED_MIMES =
            "application/pdf," +
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    @BeforeEach
    void setUp() {
        service = new FileValidationService(MAX_SIZE, ALLOWED_MIMES);
    }

    // ─── Happy-path ──────────────────────────────────────────────────────────

    @Test
    void validPdf_returnsDetectedMime() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.pdf");
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.pdf", "application/pdf", bytes);

        String mime = service.validate(file);

        assertThat(mime).isEqualTo("application/pdf");
    }

    @Test
    void validDocx_returnsDetectedMime() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.docx");
        MockMultipartFile file = new MockMultipartFile(
                "file", "resume.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                bytes);

        String mime = service.validate(file);

        assertThat(mime).isEqualTo(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    // ─── Rejection cases ─────────────────────────────────────────────────────

    @Test
    void emptyFile_throwsInvalidFileException() {
        MockMultipartFile empty = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]);

        assertThatThrownBy(() -> service.validate(empty))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void nullFile_throwsInvalidFileException() {
        assertThatThrownBy(() -> service.validate(null))
                .isInstanceOf(InvalidFileException.class);
    }

    @Test
    void oversizedFile_throwsInvalidFileException() {
        // 6 MB of zeros — exceeds the 5 MB limit
        byte[] bigData = new byte[6 * 1024 * 1024];
        MockMultipartFile big = new MockMultipartFile(
                "file", "big.pdf", "application/pdf", bigData);

        assertThatThrownBy(() -> service.validate(big))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("exceeds");
    }

    @Test
    void renamedExeAsPdf_isRejectedByMimeCheck() {
        // Simulate a .exe renamed to .pdf — client sends Content-Type: application/pdf
        // but the magic bytes reveal the real type. We use a ZIP header as a stand-in.
        byte[] zipHeader = {0x50, 0x4B, 0x03, 0x04, 0, 0, 0, 0, 0, 0}; // PK header
        MockMultipartFile fake = new MockMultipartFile(
                "file", "evil.pdf", "application/pdf", zipHeader);

        // Tika will detect this as application/zip or similar, not application/pdf
        assertThatThrownBy(() -> service.validate(fake))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("not supported");
    }

    @Test
    void imageFileAsPdf_isRejectedByMimeCheck() {
        // JPEG magic bytes: FF D8 FF
        byte[] jpegHeader = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
                              0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00};
        MockMultipartFile fake = new MockMultipartFile(
                "file", "photo.pdf", "application/pdf", jpegHeader);

        assertThatThrownBy(() -> service.validate(fake))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("not supported");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private byte[] fixtureBytes(String resourcePath) throws IOException {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            assertThat(is).as("Test fixture not found: " + resourcePath).isNotNull();
            return is.readAllBytes();
        }
    }
}
