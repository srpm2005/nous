package com.project.nous.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a resume record is not found by ID.
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResumeNotFoundException extends RuntimeException {

    public ResumeNotFoundException(String id) {
        super("Resume not found: " + id);
    }
}
