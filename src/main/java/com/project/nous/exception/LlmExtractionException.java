package com.project.nous.exception;

/**
 * Exception thrown when the LLM role extraction pipeline encounters an API error, timeout, or schema parsing failure.
 */
public class LlmExtractionException extends RuntimeException {

    public LlmExtractionException(String message) {
        super(message);
    }

    public LlmExtractionException(String message, Throwable cause) {
        super(message, cause);
    }
}
