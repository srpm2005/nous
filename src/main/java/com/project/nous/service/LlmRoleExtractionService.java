package com.project.nous.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.nous.dto.LlmResponseDto;
import com.project.nous.dto.RoleSuggestionDto;
import com.project.nous.exception.LlmExtractionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service responsible for invoking LLM APIs, building structured prompts, defense-parsing JSON output,
 * and extracting target job roles with confidence scores.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LlmRoleExtractionService {

    private final RestClient llmRestClient;
    private final ObjectMapper objectMapper;

    @Value("${app.llm.enabled:true}")
    private boolean llmEnabled;

    @Value("${app.llm.api-key:mock-key}")
    private String apiKey;

    @Value("${app.llm.model:gpt-4o-mini}")
    private String model;

    private static final Pattern JSON_CODE_BLOCK_PATTERN = Pattern.compile("```(?:json)?\\s*(.*?)\\s*```", Pattern.DOTALL);

    /**
     * Extracts top matching job roles from extracted resume text.
     *
     * @param extractedText Raw extracted resume text.
     * @return LlmResponseDto containing structured role suggestions.
     */
    public LlmResponseDto extractRoles(String extractedText) {
        if (extractedText == null || extractedText.isBlank()) {
            throw new LlmExtractionException("Cannot extract roles: Extracted resume text is null or empty");
        }

        // If LLM is disabled or using mock API key, fall back to offline heuristic extraction
        if (!llmEnabled || "mock-key".equalsIgnoreCase(apiKey) || apiKey.isBlank()) {
            log.info("LLM API key is set to mock/disabled. Operating in offline heuristic fallback mode.");
            return generateHeuristicFallback(extractedText);
        }

        try {
            String promptPayload = buildOpenAiPayload(extractedText);

            String responseBody = llmRestClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(promptPayload)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {
                throw new LlmExtractionException("Received empty response from LLM API endpoint");
            }

            return parseOpenAiResponse(responseBody, extractedText);

        } catch (LlmExtractionException e) {
            throw e;
        } catch (Exception e) {
            log.warn("LLM API call failed ({}: {}). Engaging heuristic fallback.", e.getClass().getSimpleName(), e.getMessage());
            return generateHeuristicFallback(extractedText);
        }
    }

    /**
     * Constructs OpenAI-compatible chat completion JSON payload with strict JSON schema instructions.
     */
    public String buildOpenAiPayload(String extractedText) {
        String systemPrompt = "You are an expert HR AI Career Advisor. Analyze the candidate resume text and extract top target job roles. " +
                "Output ONLY a valid JSON object matching schema: {\"roles\": [{\"roleTitle\": string, \"rank\": int, \"confidenceScore\": float (0.0-1.0), \"matchReason\": string, \"keySkills\": [string]}]}";

        // Truncate text if excessively long to prevent token overflow
        String truncatedText = extractedText.length() > 8000 ? extractedText.substring(0, 8000) : extractedText;

        Map<String, Object> systemMsg = Map.of("role", "system", "content", systemPrompt);
        Map<String, Object> userMsg = Map.of("role", "user", "content", "Resume Text:\n" + truncatedText);

        Map<String, Object> payloadMap = new LinkedHashMap<>();
        payloadMap.put("model", model);
        payloadMap.put("messages", List.of(systemMsg, userMsg));
        payloadMap.put("temperature", 0.2);

        try {
            return objectMapper.writeValueAsString(payloadMap);
        } catch (Exception e) {
            throw new LlmExtractionException("Failed to serialize LLM request payload", e);
        }
    }

    /**
     * Parses the LLM API JSON response string, sanitizing markdown code blocks if present.
     */
    @SuppressWarnings("unchecked")
    public LlmResponseDto parseOpenAiResponse(String responseJson, String originalText) {
        try {
            Map<String, Object> responseMap = objectMapper.readValue(responseJson, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new LlmExtractionException("Malformed LLM response: missing choices array");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String content = (String) message.get("content");

            String sanitizedJson = sanitizeJsonOutput(content);
            LlmResponseDto parsedDto = objectMapper.readValue(sanitizedJson, LlmResponseDto.class);

            if (parsedDto.getRoles() == null || parsedDto.getRoles().isEmpty()) {
                log.warn("LLM returned 0 roles. Falling back to heuristic extraction.");
                return generateHeuristicFallback(originalText);
            }

            parsedDto.setRawText(sanitizedJson);
            return parsedDto;

        } catch (Exception e) {
            log.error("Failed to parse LLM JSON response. Content received: {}", responseJson, e);
            return generateHeuristicFallback(originalText);
        }
    }

    /**
     * Sanitizes response strings by stripping markdown code fences (` ```json ` or ` ``` `).
     */
    public String sanitizeJsonOutput(String content) {
        if (content == null) return "{}";
        String trimmed = content.trim();
        Matcher matcher = JSON_CODE_BLOCK_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return trimmed;
    }

    /**
     * Calculates an accurate dynamic confidence score based on explicit skill keyword overlap
     * between the candidate's resume text and the required key skills for a role.
     */
    public double calculateAccurateScore(String text, List<String> keySkills, double baseWeight) {
        if (text == null || text.isBlank() || keySkills == null || keySkills.isEmpty()) {
            return baseWeight;
        }

        String lowerText = text.toLowerCase(Locale.ROOT);
        int matchedCount = 0;
        int totalSkillMentions = 0;

        for (String skill : keySkills) {
            String lowerSkill = skill.toLowerCase(Locale.ROOT).trim();
            if (lowerSkill.isBlank()) continue;

            if (Pattern.compile("\\b" + Pattern.quote(lowerSkill) + "\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()
                    || lowerText.contains(lowerSkill)) {
                matchedCount++;

                Matcher matcher = Pattern.compile(Pattern.quote(lowerSkill), Pattern.CASE_INSENSITIVE).matcher(text);
                while (matcher.find()) {
                    totalSkillMentions++;
                }
            }
        }

        double skillMatchRatio = (double) matchedCount / keySkills.size();
        double frequencyBonus = Math.min(0.08, totalSkillMentions * 0.015);

        double finalScore = 0.55 + (skillMatchRatio * 0.35) + frequencyBonus;
        double clamped = Math.min(0.98, Math.max(0.65, finalScore));
        return Math.round(clamped * 100.0) / 100.0;
    }

    /**
     * Generates a deterministic heuristic fallback response when external LLM is offline or unconfigured.
     */
    public LlmResponseDto generateHeuristicFallback(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        List<RoleSuggestionDto> roles = new ArrayList<>();

        boolean matchesJava = Pattern.compile("\\bjava\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()
                || lower.contains("spring")
                || Pattern.compile("\\bbackend\\b", Pattern.CASE_INSENSITIVE).matcher(text).find();

        boolean matchesFrontend = lower.contains("react")
                || lower.contains("javascript")
                || lower.contains("frontend")
                || lower.contains("css");

        boolean matchesAiData = lower.contains("python")
                || Pattern.compile("\\bdata\\b", Pattern.CASE_INSENSITIVE).matcher(text).find()
                || lower.contains("machine learning")
                || Pattern.compile("\\bai\\b", Pattern.CASE_INSENSITIVE).matcher(text).find();

        if (matchesJava) {
            List<String> javaSkills = List.of("Java", "Spring Boot", "REST API", "PostgreSQL", "JPA");
            double score = calculateAccurateScore(text, javaSkills, 0.92);
            roles.add(RoleSuggestionDto.builder()
                    .roleTitle("Java Backend Engineer")
                    .rank(roles.size() + 1)
                    .confidenceScore(score)
                    .matchReason("Strong keyword match for Java, Spring Boot, REST APIs, and backend system development (" + Math.round(score * 100) + "% match accuracy).")
                    .keySkills(javaSkills)
                    .build());
        }

        if (matchesFrontend) {
            List<String> feSkills = List.of("React", "JavaScript", "HTML/CSS", "Vite", "UI Development");
            double score = calculateAccurateScore(text, feSkills, 0.88);
            roles.add(RoleSuggestionDto.builder()
                    .roleTitle("Full Stack Software Engineer")
                    .rank(roles.size() + 1)
                    .confidenceScore(score)
                    .matchReason("Demonstrated capabilities across React frontend web development and application UI state management (" + Math.round(score * 100) + "% match accuracy).")
                    .keySkills(feSkills)
                    .build());
        }

        if (matchesAiData) {
            List<String> aiSkills = List.of("Python", "Data Pipelines", "AI Integration", "SQL");
            double score = calculateAccurateScore(text, aiSkills, 0.85);
            roles.add(RoleSuggestionDto.builder()
                    .roleTitle("AI / Data Engineer")
                    .rank(roles.size() + 1)
                    .confidenceScore(score)
                    .matchReason("Experience detected in data processing pipelines, AI integration, and analytical modeling (" + Math.round(score * 100) + "% match accuracy).")
                    .keySkills(aiSkills)
                    .build());
        }

        // Default fallback if no specific keywords hit
        if (roles.isEmpty()) {
            List<String> defSkills = List.of("Software Engineering", "Problem Solving", "System Design");
            double score = calculateAccurateScore(text, defSkills, 0.75);
            roles.add(RoleSuggestionDto.builder()
                    .roleTitle("Software Developer")
                    .rank(1)
                    .confidenceScore(score)
                    .matchReason("General software development background extracted from candidate resume experience.")
                    .keySkills(defSkills)
                    .build());
        }

        // Sort roles by calculated confidence score descending so best match is always #1
        roles.sort(Comparator.comparing(RoleSuggestionDto::getConfidenceScore).reversed());
        for (int i = 0; i < roles.size(); i++) {
            roles.get(i).setRank(i + 1);
        }

        return LlmResponseDto.builder()
                .roles(roles)
                .rawText("Heuristic Fallback Engine")
                .build();
    }

}
