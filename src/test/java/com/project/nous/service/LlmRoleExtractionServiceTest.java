package com.project.nous.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.nous.dto.LlmResponseDto;
import com.project.nous.dto.RoleSuggestionDto;
import com.project.nous.exception.LlmExtractionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for {@link LlmRoleExtractionService}.
 */
class LlmRoleExtractionServiceTest {

    private LlmRoleExtractionService service;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        RestClient restClient = RestClient.builder().build();
        service = new LlmRoleExtractionService(restClient, objectMapper);

        // Inject default test properties
        ReflectionTestUtils.setField(service, "llmEnabled", true);
        ReflectionTestUtils.setField(service, "apiKey", "mock-key");
        ReflectionTestUtils.setField(service, "model", "gpt-4o-mini");
    }

    @Test
    @DisplayName("Blank or null resume text should throw LlmExtractionException")
    void extractRoles_nullOrBlankText_throwsLlmExtractionException() {
        assertThatThrownBy(() -> service.extractRoles(null))
                .isInstanceOf(LlmExtractionException.class)
                .hasMessageContaining("Extracted resume text is null or empty");

        assertThatThrownBy(() -> service.extractRoles("   "))
                .isInstanceOf(LlmExtractionException.class)
                .hasMessageContaining("Extracted resume text is null or empty");
    }

    @Test
    @DisplayName("Mock API key triggers heuristic fallback extraction safely")
    void extractRoles_mockKey_returnsHeuristicFallback() {
        String resumeText = "Senior Java Developer with 5 years experience in Spring Boot, REST APIs, and PostgreSQL.";

        LlmResponseDto result = service.extractRoles(resumeText);

        assertThat(result).isNotNull();
        assertThat(result.getRoles()).isNotEmpty();

        RoleSuggestionDto topRole = result.getRoles().get(0);
        assertThat(topRole.getRoleTitle()).contains("Java");
        assertThat(topRole.getConfidenceScore()).isGreaterThan(0.8);
        assertThat(topRole.getKeySkills()).contains("Java", "Spring Boot");
    }

    @Test
    @DisplayName("Markdown code blocks with ```json fences are sanitized correctly")
    void sanitizeJsonOutput_stripsMarkdownCodeFences() {
        String rawContent = "```json\n{\"roles\":[{\"roleTitle\":\"Software Engineer\"}]}\n```";

        String sanitized = service.sanitizeJsonOutput(rawContent);

        assertThat(sanitized).isEqualTo("{\"roles\":[{\"roleTitle\":\"Software Engineer\"}]}");
    }

    @Test
    @DisplayName("Valid OpenAI response JSON is correctly parsed into LlmResponseDto")
    void parseOpenAiResponse_validJson_returnsParsedDto() {
        String openAiResponseJson = "{"
                + "\"choices\": [{"
                + "  \"message\": {"
                + "    \"content\": \"{\\\"roles\\\":[{\\\"roleTitle\\\":\\\"Backend Developer\\\",\\\"rank\\\":1,\\\"confidenceScore\\\":0.95,\\\"matchReason\\\":\\\"Java alignment\\\",\\\"keySkills\\\":[\\\"Java\\\"]}]}\""
                + "  }"
                + "}]"
                + "}";

        LlmResponseDto responseDto = service.parseOpenAiResponse(openAiResponseJson, "Java Resume Text");

        assertThat(responseDto).isNotNull();
        assertThat(responseDto.getRoles()).hasSize(1);
        assertThat(responseDto.getRoles().get(0).getRoleTitle()).isEqualTo("Backend Developer");
        assertThat(responseDto.getRoles().get(0).getConfidenceScore()).isEqualTo(0.95);
    }

    @Test
    @DisplayName("Heuristic engine categorizes React & JavaScript resume text as Full Stack / Frontend Role")
    void generateHeuristicFallback_reactResume_returnsFullStackRole() {
        String reactResumeText = "Frontend engineer with React, JavaScript, Vite, HTML, CSS, and web development experience.";

        LlmResponseDto responseDto = service.generateHeuristicFallback(reactResumeText);

        assertThat(responseDto.getRoles()).isNotEmpty();
        RoleSuggestionDto topRole = responseDto.getRoles().get(0);
        assertThat(topRole.getRoleTitle()).contains("Full Stack");
        assertThat(topRole.getKeySkills()).contains("React", "JavaScript");
    }
}
