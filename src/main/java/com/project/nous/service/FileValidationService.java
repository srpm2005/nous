package com.project.nous.service;

import com.project.nous.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * Validates an uploaded file before it touches long-term storage.
 *
 * <h3>Checks performed (in order):</h3>
 * <ol>
 *   <li>Non-empty — file must have bytes</li>
 *   <li>Size — must not exceed {@code app.upload.max-size-bytes}</li>
 *   <li>MIME type — detected from magic bytes via Apache Tika,
 *       not from the client-supplied Content-Type or file extension</li>
 * </ol>
 *
 * <p>Checking the MIME from magic bytes is the critical defence here:
 * a malicious user can rename {@code evil.exe} to {@code resume.pdf} and
 * submit it with Content-Type: application/pdf. Tika reads the actual file
 * header and will correctly identify it as {@code application/x-msdownload}.
 */
@Slf4j
@Service
public class FileValidationService {

    private final long maxSizeBytes;
    private final List<String> allowedMimeTypes;
    private final Tika tika;

    public FileValidationService(
            @Value("${app.upload.max-size-bytes:5242880}") long maxSizeBytes,
            @Value("${app.upload.allowed-mime-types:" +
                   "application/pdf," +
                   "application/vnd.openxmlformats-officedocument.wordprocessingml.document}")
            String allowedMimeTypesCsv) {
        this.maxSizeBytes = maxSizeBytes;
        this.allowedMimeTypes = Arrays.asList(allowedMimeTypesCsv.split(","));
        this.tika = new Tika();
    }

    /**
     * Validate the file. Throws {@link InvalidFileException} if any check fails.
     *
     * @param file the incoming multipart file
     * @return the detected MIME type (for callers to use downstream)
     */
    public String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("No file provided or file is empty.");
        }

        // 1. Size check
        if (file.getSize() > maxSizeBytes) {
            throw new InvalidFileException(String.format(
                    "File size %d bytes exceeds maximum allowed size of %d bytes (5 MB).",
                    file.getSize(), maxSizeBytes));
        }

        // 2. MIME type check via magic bytes
        String detectedMime;
        try {
            detectedMime = tika.detect(file.getBytes());
        } catch (IOException ex) {
            log.error("Failed to read file bytes for MIME detection", ex);
            throw new InvalidFileException("Could not read uploaded file.", ex);
        }

        log.debug("Detected MIME type '{}' for file '{}'", detectedMime, file.getOriginalFilename());

        if (!allowedMimeTypes.contains(detectedMime)) {
            throw new InvalidFileException(String.format(
                    "File type '%s' is not supported. Only PDF and DOCX files are accepted. " +
                    "(Detected from file content, not extension.)", detectedMime));
        }

        return detectedMime;
    }
}
