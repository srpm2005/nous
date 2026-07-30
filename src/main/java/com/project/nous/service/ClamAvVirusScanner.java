package com.project.nous.service;

import com.project.nous.exception.VirusScanException;
import fi.solita.clamav.ClamAVClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * ClamAV-backed virus scanner.
 * Activated when {@code app.clamav.enabled=true}.
 *
 * <p>Requires a running {@code clamd} daemon reachable at the configured host/port.
 * The file is streamed over a TCP socket — the file never needs to be on a path
 * accessible to the daemon.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.clamav.enabled", havingValue = "true")
public class ClamAvVirusScanner implements VirusScanner {

    private final ClamAVClient client;

    public ClamAvVirusScanner(
            @Value("${app.clamav.host:localhost}") String host,
            @Value("${app.clamav.port:3310}") int port,
            @Value("${app.clamav.timeout-ms:5000}") int timeoutMs) {
        this.client = new ClamAVClient(host, port, timeoutMs);
        log.info("ClamAV virus scanner active — daemon at {}:{}", host, port);
    }

    @Override
    public void scan(Path filePath) throws VirusScanException {
        log.debug("Scanning file with ClamAV: {}", filePath.getFileName());
        try (InputStream is = Files.newInputStream(filePath)) {
            byte[] reply = client.scan(is);
            if (!ClamAVClient.isCleanReply(reply)) {
                String response = new String(reply).trim();
                log.warn("ClamAV detected threat in {}: {}", filePath.getFileName(), response);
                throw new VirusScanException(
                        "Malware detected in uploaded file. Upload rejected.");
            }
            log.debug("ClamAV scan clean for: {}", filePath.getFileName());
        } catch (IOException ex) {
            // Scanner connectivity failure — treat as blocking to stay safe
            log.error("ClamAV scanner error for {}: {}", filePath.getFileName(), ex.getMessage());
            throw new VirusScanException(
                    "Virus scanner unavailable. Please try again shortly.", ex);
        }
    }
}
