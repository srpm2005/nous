package com.project.nous.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.nio.file.Path;

/**
 * Default no-op virus scanner — active when {@code app.clamav.enabled} is
 * {@code false} (or not set). Logs a single warning at startup so operators
 * know the scanner is disabled, then lets every file through.
 *
 * <p>Replace with {@link ClamAvVirusScanner} in production by setting
 * {@code app.clamav.enabled=true} in your environment.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.clamav.enabled", havingValue = "false", matchIfMissing = true)
public class NoOpVirusScanner implements VirusScanner {

    public NoOpVirusScanner() {
        log.warn("⚠️  Virus scanning is DISABLED (app.clamav.enabled=false). " +
                 "Enable ClamAV in production before handling untrusted uploads.");
    }

    @Override
    public void scan(Path filePath) {
        // Intentionally no-op. Switch to ClamAvVirusScanner for real scanning.
        log.debug("NoOp virus scan skipped for: {}", filePath.getFileName());
    }
}
