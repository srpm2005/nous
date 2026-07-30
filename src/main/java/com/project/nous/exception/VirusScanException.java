package com.project.nous.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when a virus is detected in an uploaded file,
 * or when the virus scanner itself fails unexpectedly.
 */
@ResponseStatus(HttpStatus.UNPROCESSABLE_ENTITY)
public class VirusScanException extends RuntimeException {

    public VirusScanException(String message) {
        super(message);
    }

    public VirusScanException(String message, Throwable cause) {
        super(message, cause);
    }
}
