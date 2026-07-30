package com.project.nous.service;

import com.project.nous.exception.InvalidFileException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link TextExtractionService}.
 *
 * <p>Uses real fixture files so we validate actual PDFBox + POI behaviour,
 * not mocks. No Spring context required.
 */
class TextExtractionServiceTest {

    private static final String MIME_PDF  = "application/pdf";
    private static final String MIME_DOCX =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    private TextExtractionService service;

    @BeforeEach
    void setUp() {
        service = new TextExtractionService();
    }

    // ─── PDF extraction ──────────────────────────────────────────────────────

    @Test
    void extractFromPdf_returnsNonEmptyText() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.pdf");

        String text = service.extract(bytes, MIME_PDF);

        assertThat(text)
                .isNotBlank()
                .containsIgnoringCase("Test Resume Content");
    }

    @Test
    void extractFromPdf_textIsTrimmed() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.pdf");

        String text = service.extract(bytes, MIME_PDF);

        assertThat(text).doesNotStartWith(" ");
        assertThat(text).doesNotEndWith(" ");
    }

    // ─── DOCX extraction ─────────────────────────────────────────────────────

    @Test
    void extractFromDocx_returnsNonEmptyText() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.docx");

        String text = service.extract(bytes, MIME_DOCX);

        assertThat(text)
                .isNotBlank()
                .containsIgnoringCase("John Doe");
    }

    @Test
    void extractFromDocx_containsAllParagraphs() throws IOException {
        byte[] bytes = fixtureBytes("fixtures/sample_resume.docx");

        String text = service.extract(bytes, MIME_DOCX);

        assertThat(text).contains("Java", "Spring Boot", "PostgreSQL");
    }

    // ─── Error cases ─────────────────────────────────────────────────────────

    @Test
    void unsupportedMime_throwsInvalidFileException() {
        byte[] garbage = "not a real file".getBytes();

        assertThatThrownBy(() -> service.extract(garbage, "text/plain"))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("Unsupported MIME type");
    }

    @Test
    void corruptPdfBytes_throwsInvalidFileException() {
        byte[] corrupt = "this is not a pdf at all".getBytes();

        assertThatThrownBy(() -> service.extract(corrupt, MIME_PDF))
                .isInstanceOf(InvalidFileException.class)
                .hasMessageContaining("extract text");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private byte[] fixtureBytes(String resourcePath) throws IOException {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            assertThat(is).as("Test fixture not found: " + resourcePath).isNotNull();
            return is.readAllBytes();
        }
    }
}
