package com.project.nous.service;

import com.project.nous.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;

/**
 * Extracts plain text from PDF and DOCX files.
 *
 * <ul>
 *   <li>PDF  — Apache PDFBox {@link PDFTextStripper}</li>
 *   <li>DOCX — Apache POI {@link XWPFWordExtractor}</li>
 * </ul>
 *
 * <p><strong>PII note:</strong> extracted text is NOT logged at any level.
 * The logger level for this class is set to WARN in application.properties.
 */
@Slf4j
@Service
public class TextExtractionService {

    private static final String MIME_PDF  = "application/pdf";
    private static final String MIME_DOCX =
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    /**
     * Extract plain text from the given file bytes.
     *
     * @param fileBytes  raw bytes of the uploaded file
     * @param mimeType   Tika-detected MIME type
     * @return extracted plain text; may be empty if the document has no text layer
     * @throws InvalidFileException if extraction fails (corrupt/password-protected file)
     */
    public String extract(byte[] fileBytes, String mimeType) {
        log.info("Starting text extraction for MIME type: {}", mimeType);

        try {
            String text = switch (mimeType) {
                case MIME_PDF  -> extractFromPdf(fileBytes);
                case MIME_DOCX -> extractFromDocx(fileBytes);
                default -> throw new InvalidFileException(
                        "Unsupported MIME type for extraction: " + mimeType);
            };

            log.info("Text extraction complete. Extracted {} characters.", text.length());
            return text.trim();

        } catch (IOException ex) {
            log.error("Text extraction failed for MIME type {}: {}", mimeType, ex.getMessage());
            throw new InvalidFileException(
                    "Could not extract text from the uploaded file. " +
                    "The file may be corrupt, password-protected, or contain only images. " +
                    "Please upload a text-based PDF or DOCX.", ex);
        }
    }

    // ─── Private helpers ────────────────────────────────────────────────────

    private String extractFromPdf(byte[] bytes) throws IOException {
        try (PDDocument doc = Loader.loadPDF(bytes)) {
            if (doc.isEncrypted()) {
                throw new InvalidFileException(
                        "The uploaded PDF is password-protected. Please upload an unencrypted file.");
            }
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true); // maintain reading order
            return stripper.getText(doc);
        }
    }

    private String extractFromDocx(byte[] bytes) throws IOException {
        try (XWPFDocument doc    = new XWPFDocument(new ByteArrayInputStream(bytes));
             XWPFWordExtractor ex = new XWPFWordExtractor(doc)) {
            return ex.getText();
        }
    }
}
