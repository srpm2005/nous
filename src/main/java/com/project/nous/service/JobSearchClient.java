package com.project.nous.service;

import com.project.nous.dto.JobListingDto;

import java.util.List;

/**
 * Unified interface for searching external job providers.
 */
public interface JobSearchClient {

    /**
     * Search for live job openings for a given role title and location filter.
     *
     * @param roleTitle Inferred target role title (e.g. "Senior Java Developer")
     * @param location  Location preference or null for remote default
     * @return List of normalized {@link JobListingDto}s
     */
    List<JobListingDto> searchJobs(String roleTitle, String location);

    /**
     * Returns the name of the underlying job provider strategy (e.g., "Top 500 Enterprise", "MockJobEngine").
     */
    String getProviderName();
}
