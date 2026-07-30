package com.project.nous.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Thrown when an uploaded file fails validation:
 * wrong MIME type, exceeds size limit, or is otherwise unacceptable.
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidFileException extends RuntimeException {

    public InvalidFileException(String message) {
        super(message);
    }

    public InvalidFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
