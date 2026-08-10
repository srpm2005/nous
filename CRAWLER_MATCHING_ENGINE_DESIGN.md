# Top 500 Enterprise Crawler & Skillset Matching Engine Design

> **Companion Architecture & Implementation Guide**  
> Matches code implementation directly to schema, scheduling triggers, and skill keyword overlap scoring.

---

## 1. Automated Daily Crawl Scheduling at 12:00 PM

The backend is configured with `@EnableScheduling` on `NousApplication.java` and a fixed cron trigger on `CrawlOrchestratorService.java`:

```java
@Component
@RequiredArgsConstructor
public class CrawlScheduler {

    private final CrawlOrchestratorService crawlOrchestratorService;

    /**
     * Automated Daily Trigger — Runs every day at 12:00 PM server time.
     * Pinned explicitly to Asia/Kolkata (IST).
     */
    @Scheduled(cron = "0 0 12 * * *", zone = "Asia/Kolkata")
    public void runDailyScheduledCrawl() {
        log.info("⏰ Automated 12:00 PM trigger fired for Top 500 Enterprise Crawl...");
        crawlOrchestratorService.runFullCrawlBatch();
    }
}
```

### Safety & Concurrency Safeguards:
- **`isCrawlInProgress` Check**: Prevents duplicate executions if a previous crawl batch is still running.
- **Bounded Executor Pool**: Sized to 10 concurrent threads to avoid rate-limiting or hammering company servers simultaneously.

---

## 2. Skillset Matching & Overlap Scoring Algorithm

Rather than relying on exact string joins on job titles alone, the system performs **keyword overlap scoring** using candidate `key_skills_csv` and `roleTitle` against job posting title and description fields:

```java
public int scoreSkillOverlap(JobPosting posting, SuggestedRole role) {
    if (posting == null || role == null) return 0;

    List<String> candidateSkills = Arrays.stream(role.getKeySkillsCsv().split(","))
            .map(String::trim)
            .map(String::toLowerCase)
            .filter(s -> !s.isEmpty())
            .toList();

    String fullText = ((posting.getTitle() != null ? posting.getTitle() : "") + " " 
            + (posting.getDescription() != null ? posting.getDescription() : "")).toLowerCase();

    int matchCount = 0;
    for (String skill : candidateSkills) {
        if (fullText.contains(skill)) {
            matchCount++;
        }
    }

    return matchCount;
}
```

```sql
-- Querying active openings matching role title or skill keywords
SELECT j.*, c.name 
FROM job_postings j
JOIN companies c ON j.company_id = c.id
WHERE j.is_currently_open = true 
  AND (
    LOWER(j.title) LIKE LOWER(CONCAT('%', :roleTitle, '%'))
    OR LOWER(j.department) LIKE LOWER(CONCAT('%', :roleTitle, '%'))
  );
```

---

## 3. End-to-End Pipeline Workflow

1. **Daily 12:00 PM Trigger**: `runDailyScheduledCrawl()` triggers `CrawlOrchestratorService`.
2. **Adapter Execution**: Each enterprise adapter (Greenhouse, Lever, Workday, Generic HTML) fetches job openings from active target companies.
3. **SHA-256 Deduplication & Soft Expiration**: Checks existing `posting_hash` (`SHA-256(company_id + title + apply_url)`). Updates `last_seen_at` for active positions and marks missing postings as `is_currently_open = false`.
4. **Candidate Matching Execution**: When a user uploads a resume, `Top500JobClient` matches candidate `suggested_roles` against the active `job_postings` pool using skill keyword overlap scoring.
5. **UI Rendering**: Returns tagged `JobListingDto` items grouped into role-based lanes on the frontend dashboard.
