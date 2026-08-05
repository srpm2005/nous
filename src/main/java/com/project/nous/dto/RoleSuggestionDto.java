package com.project.nous.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Data Transfer Object representing an individual role suggestion from the LLM.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSuggestionDto {

    private String roleTitle;
    private Integer rank;
    private Double confidenceScore;
    private String matchReason;
    private List<String> keySkills;
}
