package com.project.nous.domain;

/**
 * Represents the current status of an async resume scan pipeline job.
 */
public enum ScanStatus {
    /**
     * Uploaded and queued; processing has not yet begun.
     */
    PENDING,

    /**
     * Text extraction, LLM classification, or job matching is currently in progress.
     */
    PROCESSING,

    /**
     * Entire pipeline finished successfully. All roles and job listings are saved.
     */
    COMPLETE,

    /**
     * Pipeline finished with partial data (e.g. LLM succeeded, but one job API timed out).
     */
    PARTIAL,

    /**
     * Pipeline encountered an unrecoverable failure. Check errorReason for details.
     */
    FAILED
}
