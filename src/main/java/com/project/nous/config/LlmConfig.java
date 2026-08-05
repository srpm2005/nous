package com.project.nous.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

/**
 * Spring Configuration for LLM HTTP client settings, timeouts, and REST infrastructure.
 */
@Configuration
public class LlmConfig {

    @Value("${app.llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${app.llm.timeout-ms:20000}")
    private int timeoutMs;

    @Bean
    public RestClient llmRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMs);
        factory.setReadTimeout(timeoutMs);

        return RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(factory)
                .build();
    }
}
