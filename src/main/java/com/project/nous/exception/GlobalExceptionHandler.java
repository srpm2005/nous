package com.project.nous.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;

import java.net.URI;
import java.time.Instant;

/**
 * Centralised error handler — maps domain exceptions to RFC 7807 ProblemDetail
 * JSON responses so clients always get a consistent error shape.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidFileException.class)
    ProblemDetail handleInvalidFile(InvalidFileException ex) {
        log.warn("File validation failed: {}", ex.getMessage());
        return problem(HttpStatus.BAD_REQUEST, "invalid-file", ex.getMessage());
    }

    @ExceptionHandler(VirusScanException.class)
    ProblemDetail handleVirusScan(VirusScanException ex) {
        log.error("Virus scan rejection: {}", ex.getMessage());
        return problem(HttpStatus.UNPROCESSABLE_ENTITY, "virus-detected", ex.getMessage());
    }

    @ExceptionHandler(ResumeNotFoundException.class)
    ProblemDetail handleNotFound(ResumeNotFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "resume-not-found", ex.getMessage());
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    ProblemDetail handleNoResourceFound(org.springframework.web.servlet.resource.NoResourceFoundException ex) {
        return problem(HttpStatus.NOT_FOUND, "resource-not-found", ex.getMessage());
    }

    /**
     * Spring's own multipart size guard fires before our service layer — catch it here
     * so the client gets a readable 400 instead of a raw 500.
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    ProblemDetail handleMaxSize(MaxUploadSizeExceededException ex) {
        return problem(HttpStatus.BAD_REQUEST, "file-too-large",
                "File exceeds the maximum allowed size of 5 MB.");
    }

    /**
     * Fired by Spring MVC when the required 'file' multipart part is missing entirely.
     */
    @ExceptionHandler(MissingServletRequestPartException.class)
    ProblemDetail handleMissingPart(MissingServletRequestPartException ex) {
        return problem(HttpStatus.BAD_REQUEST, "missing-file-part",
                "Required request part 'file' is missing. Please attach a PDF or DOCX file.");
    }

    /**
     * Fired when POST is made without multipart/form-data Content-Type
     * (e.g. curl POST with no -F flags).
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ProblemDetail handleWrongContentType(HttpMediaTypeNotSupportedException ex) {
        return problem(HttpStatus.BAD_REQUEST, "missing-file-part",
                "No file attached. Please upload a PDF or DOCX using multipart/form-data.");
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "internal-error",
                "An unexpected error occurred. Please try again later.");
    }

    // ─────────────────────────────────────────────────────────────────────────

    private ProblemDetail problem(HttpStatus status, String errorCode, String detail) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail);
        pd.setType(URI.create("https://nous.app/errors/" + errorCode));
        pd.setProperty("timestamp", Instant.now().toString());
        return pd;
    }
}
