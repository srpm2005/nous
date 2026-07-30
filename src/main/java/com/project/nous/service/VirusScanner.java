package com.project.nous.service;

import com.project.nous.exception.VirusScanException;

import java.nio.file.Path;

/**
 * Contract for virus scanning uploaded files before they are stored long-term.
 *
 * <p>Two implementations are provided:
 * <ul>
 *   <li>{@link NoOpVirusScanner} — active by default (logs a warning, does nothing).</li>
 *   <li>{@link ClamAvVirusScanner} — activated via {@code app.clamav.enabled=true}.</li>
 * </ul>
 */
public interface VirusScanner {

    /**
     * Scan the file at the given path.
     *
     * @param filePath path to the file to scan
     * @throws VirusScanException if a virus/malware is detected, or if the scanner
     *                            itself errors in a way that should block storage
     */
    void scan(Path filePath) throws VirusScanException;
}
