package com.project.nous.service;

import com.project.nous.domain.Resume;

/**
 * Wraps the result of a resume upload, carrying both the saved entity
 * and a flag indicating whether the file was a duplicate (same SHA-256
 * as an existing record).
 */
public record UploadResult(Resume resume, boolean isDuplicate) {}
