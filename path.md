# Top-500 Company Screening — Feature Roadmap

*A daily crawl of major companies' own career pages (Microsoft, Amazon, Google, etc.), feeding fresh openings straight into Nous — reviewed from a senior engineering perspective*

## 1. What This Feature Actually Is

Today, Nous finds job openings by calling third-party aggregator APIs (Adzuna, Jooble). This feature adds a **second, proprietary source**: once a day, at a fixed time, the system visits the actual career pages of ~500 major companies (`microsoft.com/careers`, `amazon.jobs`, `careers.google.com`, etc.), pulls their current open positions, and stores them directly in the Nous database. When a resume is scanned, matched roles are checked against this dataset too — often the freshest and most authoritative source, since it comes straight from the employer instead of a re-indexed aggregator.

**The one thing to get right early, because it drives everything else below:** this is not "one scraper," it's **500 different websites, each built differently**, that all need to be checked once a day, reliably, without the whole run collapsing because 40 of them changed their HTML or started blocking requests overnight. The architecture needs to expect constant partial failure, the same way the existing resume pipeline expects partial failure from the LLM and job APIs (see the original engineering plan, §6).

---

## 2. The Single Biggest Risk: Legal and Practical, Not Technical

Before any architecture: scraping large companies' websites directly carries real risk that's worth naming up front rather than discovering later.

- Most large companies' Terms of Service explicitly restrict automated scraping of their site.
- Many "career pages" (including Microsoft's, Amazon's, and Google's) are actually front-ends for a handful of **Applicant Tracking Systems (ATS)** — Greenhouse, Lever, Workday, SuccessFactors, iCIMS — several of which expose **official, public, documented JSON APIs** meant for exactly this purpose (job board widgets, aggregators). Where that's available, use it — it's stable, fast, officially sanctioned, and won't break every time someone redesigns a webpage.
- For companies with no public API, the fallback is respectful HTML scraping: check `robots.txt`, identify with a clear User-Agent, rate-limit aggressively, and only fetch what's needed for a job-listing page.
- **Recommendation:** build the adapter framework (§4) so "official API" and "polite scraping" are two interchangeable strategies per company — same pattern as the Strategy-pattern swaps already used elsewhere in Nous (virus scanning, job search providers) — and bias the initial company list toward employers whose ATS exposes a public API. That alone likely covers a large share of the top 500, since Greenhouse and Lever are extremely common among large tech employers.

This isn't a legal opinion — a real deployment should have this reviewed properly before going live with 500 companies. But it materially changes the architecture, so it belongs in the plan, not as a footnote.

---

## 3. Architecture

```
                         ┌─────────────────────────────┐
                         │   Scheduler (cron, 12:00)    │
                         │   @Scheduled in Spring Boot  │
                         └───────────────┬──────────────┘
                                         │ triggers
                                         ▼
                         ┌─────────────────────────────┐
                         │      Crawl Orchestrator      │
                         │  reads `companies` table,     │
                         │  fans work out to a worker    │
                         │  pool, tracks a `crawl_run`   │
                         └───────────────┬──────────────┘
                                         │ one task per company
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
          ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
          │ Greenhouse    │     │ Lever         │     │ Generic HTML  │
          │ Adapter       │     │ Adapter       │     │ / Headless    │
          │ (public API)  │     │ (public API)  │     │ Adapter       │
          └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
                  └─────────────────────┼─────────────────────┘
                                         ▼
                         ┌─────────────────────────────┐
                         │   Normalizer & Deduplicator   │
                         │  same shape regardless of      │
                         │  source, hash-based dedupe     │
                         └───────────────┬──────────────┘
                                         ▼
                         ┌─────────────────────────────┐
                         │        PostgreSQL             │
                         │  companies / job_postings /   │
                         │  crawl_runs / crawl_results    │
                         └───────────────┬──────────────┘
                                         ▼
                         ┌─────────────────────────────┐
                         │  Existing Nous matching flow  │
                         │  (role classification already │
                         │  built) now also searches      │
                         │  this table, not just Adzuna   │
                         └─────────────────────────────┘
```

This plugs into the existing pipeline at exactly one point: **Phase 4 (Job API Integration)** from the original plan gains a second data source, searched the same way the existing `JobSearchClient` interface already searches Adzuna/Jooble — this new dataset is just another implementation of that same interface, backed by Nous's own database instead of a live API call.

---

## 4. The Adapter Framework (Why 500 Companies Doesn't Mean 500 Different Codebases)

Rather than writing custom scraping code per company, classify every company by **which underlying platform serves their career page**, and write one adapter per platform:

```java
public interface CareerPageAdapter {
    List<RawJobPosting> fetchOpenings(Company company);
    boolean supports(Company company);
}
```

| Adapter | How it works | Rough share of large employers |
|---|---|---|
| `GreenhouseAdapter` | Calls Greenhouse's public `boards-api.greenhouse.io/v1/boards/{token}/jobs` endpoint | Common among tech companies |
| `LeverAdapter` | Calls Lever's public `api.lever.co/v0/postings/{company}` endpoint | Common among tech/startups |
| `WorkdayAdapter` | Workday-powered career sites expose a semi-structured JSON endpoint per tenant; more fragile, but scriptable | Common among large enterprises (often Microsoft/Amazon-scale companies) |
| `GenericHtmlAdapter` | Fetches the page, parses structured job-listing markup (many sites use consistent `<script type="application/ld+json">` JobPosting schema.org markup — check for this first, it's far more reliable than scraping visible HTML) | Fallback |
| `HeadlessBrowserAdapter` | For JS-rendered career pages with no API and no structured markup, render with a headless browser before parsing | Last resort — slow and fragile, use sparingly |

**Why this matters for the roadmap:** the first implementation milestone isn't "handle all 500 companies," it's "build the adapter interface + Greenhouse + Lever + generic `schema.org/JobPosting` parsing," since between those three you likely cover a large fraction of the list with a fraction of the effort. Save the headless-browser fallback for the long tail, and expect a modest number of companies to simply resist automated access entirely — the system needs to tolerate that permanently, not treat it as a bug to eventually fix to 100%.

---

## 5. Data Model Additions

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL,          -- e.g. "microsoft.com"
    career_page_url VARCHAR(500) NOT NULL,
    adapter_type VARCHAR(50) NOT NULL,      -- 'GREENHOUSE' / 'LEVER' / 'WORKDAY' / 'GENERIC_HTML' / 'HEADLESS'
    adapter_config JSONB,                   -- e.g. { "board_token": "microsoft" } — adapter-specific, kept flexible on purpose
    is_active BOOLEAN DEFAULT true,         -- turn off a company without deleting history
    last_crawled_at TIMESTAMP,
    last_crawl_status VARCHAR(20)           -- 'SUCCESS' / 'PARTIAL' / 'FAILED' / 'BLOCKED'
);

CREATE TABLE job_postings (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id),
    external_id VARCHAR(255),               -- the ID the source system uses, if any
    title VARCHAR(500) NOT NULL,
    location VARCHAR(255),
    department VARCHAR(255),
    apply_url VARCHAR(1000) NOT NULL,
    posting_hash VARCHAR(64) NOT NULL,       -- SHA-256 of (company_id + title + apply_url), same dedup idea as resume hashing
    first_seen_at TIMESTAMP NOT NULL,
    last_seen_at TIMESTAMP NOT NULL,         -- updated every time this posting reappears in a crawl
    is_currently_open BOOLEAN DEFAULT true   -- flipped false when a crawl no longer finds it — see §7
);
CREATE UNIQUE INDEX idx_job_postings_hash ON job_postings(posting_hash);
CREATE INDEX idx_job_postings_company ON job_postings(company_id);
CREATE INDEX idx_job_postings_open ON job_postings(is_currently_open);

CREATE TABLE crawl_runs (
    id UUID PRIMARY KEY,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    companies_attempted INT,
    companies_succeeded INT,
    companies_partial INT,
    companies_failed INT,
    total_postings_found INT
);

CREATE TABLE crawl_results (
    id UUID PRIMARY KEY,
    crawl_run_id UUID NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id),
    status VARCHAR(20) NOT NULL,             -- 'SUCCESS' / 'FAILED' / 'BLOCKED' / 'TIMEOUT'
    postings_found INT,
    error_reason TEXT,
    duration_ms INT
);
```

`crawl_runs` and `crawl_results` exist for the same reason `scans` and its status field exist in the main pipeline: **when 40 out of 500 companies fail overnight, you need to know exactly which ones and why, without reading logs by hand.** This is directly reusing a pattern already proven in the resume-scanning pipeline, applied to a much larger fan-out.

---

## 6. The Daily Schedule

```java
@Scheduled(cron = "0 0 12 * * *")   // every day at 12:00 server time
public void runDailyCrawl() {
    crawlOrchestrator.runFullCrawl();
}
```

A few decisions worth making explicitly rather than leaving implicit:

- **Which 12:00, and does it matter?** Pin the server's timezone explicitly in configuration (`@Scheduled(cron = "...", zone = "America/New_York")` or similar) rather than relying on the deployment environment's default timezone — a silent timezone mismatch between environments is a classic, very avoidable bug.
- **What happens if the app restarts near 12:00, or the previous day's run is still going?** Guard against overlapping runs (e.g. a simple "is a crawl currently in progress" flag checked at the start of `runDailyCrawl()`), so a slow run one day doesn't collide with the next day's trigger.
- **Concurrency across 500 companies:** don't fire 500 requests at once. Use a bounded worker pool (the same `ThreadPoolTaskExecutor` pattern already used for the async resume pipeline, sized appropriately — e.g. 10–20 concurrent crawls) so you're not hammering 500 external sites simultaneously, which is both impolite and likely to trigger anti-bot defenses.
- **Per-company timeout:** a handful of slow or hanging sites shouldn't stall the entire run. Every adapter call gets its own timeout (e.g. 20–30s), and a company that times out is recorded as `TIMEOUT` in `crawl_results` and skipped, not retried endlessly mid-run.

---

## 7. Detecting Closed Positions (Not Just New Ones)

A posting that no longer appears in today's crawl has presumably closed. Rather than deleting rows (losing history), each crawl:

1. For every posting found today, updates `last_seen_at` to now (and inserts a new row if the `posting_hash` wasn't seen before).
2. At the end of the run, for a given company, any posting **not** touched in today's crawl gets `is_currently_open = false`.

This mirrors the same "state, not deletion" philosophy as the rest of Nous (soft status flags instead of destructive operations) and means Nous can show a job as "no longer available" instead of just silently dropping it, and can later analyze things like average time-to-close per company if that's ever useful.

---

## 8. Phased Delivery

### Phase 1 — Company List & Seeding
- Source an initial top-500 list (e.g. a public "largest employers" or "most active tech recruiters" ranking) and manually classify the first 30–50 by adapter type to validate the approach before scaling.
- Seed the `companies` table with `career_page_url` and best-guess `adapter_type`.

### Phase 2 — Adapter Framework + High-Coverage Adapters
- Build the `CareerPageAdapter` interface and the orchestrator that dispatches to the right adapter per company.
- Implement `GreenhouseAdapter` and `LeverAdapter` first — public APIs, high reliability, likely the fastest path to covering a meaningful chunk of the list.
- Implement the `schema.org/JobPosting` structured-data parser as part of `GenericHtmlAdapter` — check for this before falling back to raw HTML scraping, since it's dramatically more stable.

### Phase 3 — Scheduler & Orchestration
- Wire up the daily `@Scheduled` trigger, the bounded worker pool, per-company timeouts, and the overlapping-run guard.
- Build `crawl_runs` / `crawl_results` tracking from day one — this is the cheapest point to add it, and the hardest to retrofit once the crawler is "just running."

### Phase 4 — Dedup, Diffing, Closing Stale Postings
- Implement the hash-based dedup and the `is_currently_open` flip described in §7.
- Add basic alerting: if `companies_failed` in a `crawl_run` exceeds some threshold (e.g. more than 15% of attempted companies), notify — a silent, slowly-degrading crawler is worse than one that fails loudly.

### Phase 5 — Long Tail Coverage
- Add `WorkdayAdapter` and, only where genuinely necessary, `HeadlessBrowserAdapter` for the remaining companies with no API and no structured markup.
- Expect (and explicitly accept) that some percentage of the 500 will never be reliably crawlable — build a manual "mark this company as currently unsupported" override rather than letting it silently fail every single day indefinitely.

### Phase 6 — Integration Into Matching
- Implement this dataset as a second `JobSearchClient` implementation (per the Strategy pattern already used for Adzuna/Jooble), so a resume's matched roles are searched against both third-party aggregator listings and this proprietary dataset.
- Decide de-duplication behavior for overlap: the same Microsoft opening might show up via both Adzuna *and* the direct crawl — dedupe by company + normalized title + location before presenting results, and prefer the direct-from-company listing as the source of truth when both exist, since it's typically fresher.

### Phase 7 — Observability & Compliance Hardening
- Dashboard (even a simple one) showing crawl health over time: success rate per company, postings found per day, run duration trends.
- Formal review of scraping approach against each target company's ToS/`robots.txt` before scaling past the initial pilot set — this is the point to get legal input, not after 500 companies are already being crawled daily.

---

## 9. Open Questions Worth Deciding Early

- **Where does the top-500 list come from, and how often is it refreshed?** Company rankings change; decide whether this list is manually curated, sourced from a public ranking, or user-driven (e.g. "companies our users search for most").
- **What's the retry policy for a company that fails today — retried tomorrow only, or is there a same-day retry?** A simple rule (fail today, try again at tomorrow's scheduled run) is easiest to reason about and avoids retry storms; only add same-day retries later if data shows it's needed.
- **Does a `BLOCKED` company (actively rejecting the crawler) get flagged differently from a `FAILED` one (technical error)?** Distinguishing "they don't want us" from "something broke" matters both operationally and for the compliance conversation in §2.

---

## 10. How This Fits the Existing Nous Architecture

Nothing about this feature requires re-architecting what's already built — it's a genuinely additive feature that reuses patterns already proven elsewhere in the project:

| Pattern already in Nous | Reused here for |
|---|---|
| Strategy pattern (`VirusScanner`, `JobSearchClient`) | `CareerPageAdapter` per platform type; the new dataset as another `JobSearchClient` |
| Status state machine (`scans.status`) | `crawl_runs` / `crawl_results` tracking |
| Content hashing for dedup (`resumes.file_hash`) | `job_postings.posting_hash` |
| Bounded `ThreadPoolTaskExecutor` for async work | Bounded concurrent crawling across 500 companies |
| "Soft state instead of deletion" (`PARTIAL` scans) | `is_currently_open = false` instead of deleting closed postings |

That reuse is the strongest argument for building it this way: someone who already understands the resume-scanning pipeline can read this feature and recognize every major design decision, rather than learning a second, unrelated set of patterns.