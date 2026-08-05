package com.project.nous.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object representing the root JSON response expected from the LLM role classification pipeline.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LlmResponseDto {

    private List<RoleSuggestionDto> roles;
    private String rawText;
}
