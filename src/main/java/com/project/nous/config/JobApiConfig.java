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

    @Value("${app.jobapi.base-url:https://api.adzuna.com/v1/api/jobs}")
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
                .requestFactory(factory)
                .build();
    }
}
