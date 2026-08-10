package com.project.nous.service.adapter;

import com.project.nous.domain.Company;

import java.util.List;

/**
 * Strategy interface for crawling and extracting job postings from company career portals.
 */
public interface CareerPageAdapter {
    List<RawJobPosting> fetchOpenings(Company company) throws Exception;
    boolean supports(Company company);
}
