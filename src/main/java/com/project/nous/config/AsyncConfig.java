package com.project.nous.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Thread pool configuration for asynchronous resume scan processing.
 *
 * <p>Phase 2: Offloads heavy background pipeline work from Tomcat request threads
 * onto dedicated worker threads.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "scanTaskExecutor")
    public Executor scanTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("scan-worker-");
        executor.initialize();
        return executor;
    }
}
