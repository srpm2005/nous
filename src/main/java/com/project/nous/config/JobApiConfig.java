package com.project.nous.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Spring Configuration for Job Search API RestClient infrastructure, base URLs, and HTTP timeouts.
 */
@Configuration
public class JobApiConfig {

    @Value("${app.jobapi.base-url:https://api.nous.com/v1/jobs}")
    private String baseUrl;

    @Value("${app.jobapi.timeout-ms:4000}")
    private int timeoutMs;

    @Bean(name = "jobApiRestClient")
    public RestClient jobApiRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .defaultHeader("Accept", "application/json")
                .requestFactory(factory)
                .build();

    }
}
