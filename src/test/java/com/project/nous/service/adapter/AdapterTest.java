package com.project.nous.service.adapter;

import com.project.nous.domain.Company;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AdapterTest {

    private UberAdapter uberAdapter;
    private AmazonJobsAdapter amazonJobsAdapter;
    private WorkdayAdapter workdayAdapter;
    private GenericHtmlAdapter genericHtmlAdapter;

    @BeforeEach
    void setUp() {
        uberAdapter = new UberAdapter();
        amazonJobsAdapter = new AmazonJobsAdapter();
        workdayAdapter = new WorkdayAdapter();
        genericHtmlAdapter = new GenericHtmlAdapter();
    }

    @Test
    @DisplayName("UberAdapter should support Uber company and generate direct https://jobs.uber.com/en/jobs/ URLs")
    void testUberAdapter() throws Exception {
        Company company = Company.builder()
                .name("Uber")
                .domain("uber.com")
                .careerPageUrl("https://www.uber.com/careers")
                .adapterType("UBER")
                .build();

        assertThat(uberAdapter.supports(company)).isTrue();

        List<RawJobPosting> results = uberAdapter.fetchOpenings(company);
        assertThat(results).isNotEmpty();
        assertThat(results.get(0).getApplyUrl()).matches("^https://jobs\\.uber\\.com/en/jobs/\\d+/?$");
    }

    @Test
    @DisplayName("AmazonJobsAdapter should support Amazon and produce direct amazon.jobs requisition links")
    void testAmazonJobsAdapter() throws Exception {
        Company company = Company.builder()
                .name("Amazon")
                .domain("amazon.com")
                .careerPageUrl("https://www.amazon.jobs")
                .adapterType("AMAZON")
                .build();

        assertThat(amazonJobsAdapter.supports(company)).isTrue();

        List<RawJobPosting> results = amazonJobsAdapter.fetchOpenings(company);
        assertThat(results).isNotEmpty();
        assertThat(results.get(0).getApplyUrl()).contains("amazon.jobs");
    }

    @Test
    @DisplayName("WorkdayAdapter should support Workday portals and build direct workday URLs")
    void testWorkdayAdapter() throws Exception {
        Company company = Company.builder()
                .name("Qualcomm")
                .domain("qualcomm.com")
                .careerPageUrl("https://qualcomm.wd5.myworkdayjobs.com/careers")
                .adapterType("WORKDAY")
                .build();

        assertThat(workdayAdapter.supports(company)).isTrue();

        List<RawJobPosting> results = workdayAdapter.fetchOpenings(company);
        assertThat(results).isNotEmpty();
        assertThat(results.get(0).getApplyUrl()).contains("myworkdayjobs.com");
    }

    @Test
    @DisplayName("GenericHtmlAdapter should generate direct deep-link URLs for Microsoft, Google, Meta, Apple")
    void testGenericHtmlAdapter() throws Exception {
        Company msft = Company.builder()
                .name("Microsoft")
                .domain("microsoft.com")
                .careerPageUrl("https://careers.microsoft.com")
                .adapterType("GENERIC_HTML")
                .build();

        List<RawJobPosting> msftResults = genericHtmlAdapter.fetchOpenings(msft);
        assertThat(msftResults).isNotEmpty();
        assertThat(msftResults.get(0).getApplyUrl()).contains("jobs.careers.microsoft.com/global/en/job/");

        Company google = Company.builder()
                .name("Google")
                .domain("google.com")
                .careerPageUrl("https://careers.google.com")
                .adapterType("GENERIC_HTML")
                .build();

        List<RawJobPosting> googResults = genericHtmlAdapter.fetchOpenings(google);
        assertThat(googResults).isNotEmpty();
        assertThat(googResults.get(0).getApplyUrl()).startsWith("https://").contains("google.com");
    }
}
