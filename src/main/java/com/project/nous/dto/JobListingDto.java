package com.project.nous.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Data Transfer Object representing a normalized job listing returned from job search providers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobListingDto {

    private UUID id;
    private UUID scanId;
    private UUID roleId;
    private String title;
    private String company;
    private String location;
    private String salaryRange;
    private String applyUrl;
    private String sourceApi;
}
