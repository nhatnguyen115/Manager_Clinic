package com.clinic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.Getter;

/**
 * Cấu hình kết nối OpenAI API (GPT-5.3).
 * Thay thế GeminiConfig trước đó.
 */
@Configuration
@Getter
public class OpenAIConfig {

    @Value("${app.openai.api-key}")
    private String apiKey;

    @Value("${app.openai.model:gpt-5.3}")
    private String model;

    @Value("${app.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${app.openai.timeout:60}")
    private int timeoutSeconds;

    @Value("${app.openai.max-tokens:4096}")
    private int maxTokens;

    @Bean("openaiWebClient")
    public WebClient openaiWebClient() {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(4 * 1024 * 1024)) // 4MB buffer
                .build();
    }
}
