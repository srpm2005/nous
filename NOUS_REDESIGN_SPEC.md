# Nous — Redesign Specification

*A design spec for the current app, written directly against your live screenshots — not a generic restyle*

## 0. What's Actually Wrong Right Now (Read This First)

Before any visual redesign, three things visible in your own screenshots need to be fixed at the design level, because no amount of styling fixes a screen that shows contradictory numbers:

1. **"Top 500 Crawls" page shows `Direct Postings Indexed: 36`, then `Live Direct Enterprise Openings (0)` two inches below it, with an empty `Monitored Enterprise Portals` list in between.** Three numbers on one screen that all describe "how much data exists" and none of them agree. A user's very first reaction to this page is "is this broken?" — and they'd be right to think so.
2. **Every row in "My scans" shows the identical `Best match: Senior Backend Engineer`**, regardless of which resume was uploaded. This is the same templated-data bug flagged earlier on the job listings screen — it's now visible on a second screen, which means it's a data-layer bug, not a one-off UI glitch.
3. **The history list shows internal filenames (`scan_22181a24.pdf`, `scan_6f234ab7.pdf`) instead of the resume's real name** — compare to the Upload page, which correctly shows `Shri Ram Prince Mishra Resume.pdf`. The data exists; the history screen just isn't using it.

The redesign below is built around a rule that would have prevented all three: **a screen is only allowed to display a number or a summary claim if it can point to the actual rows backing it.** If there are 0 portals with results, the page must say so — not show a stat card claiming 36 next to an empty list claiming 0.

---

## 1. Design Principles for This Pass

1. **No orphaned statistics.** Every count on screen (12 portals, 36 postings, 51 scans) must be a real `COUNT()` of something the user can also see listed below it. If the list is empty, the stat above it must also read 0, or the stat must not be shown yet.
2. **Show real identity, not internal IDs.** Filenames, company names, and job titles shown to the user come from `resumes.original_filename`, `companies.name`, and the actual scraped `job_postings.title` — never from an internal ID, a scan UUID, or a template default.
3. **An empty state is a real design, not a blank space.** "0 live openings" needs its own designed message ("We haven't successfully crawled any companies yet — run a screening or check back after 12:00 PM") instead of just... nothing under the heading.
4. **Match confidence must visibly vary per resume.** If two different resumes both produce "Senior Backend Engineer" as the best match, that's plausible — but their confidence score, reasoning text, and skill chips must differ, or the design should surface a warning that classification looks degenerate (see §5).
5. **Keep the friendly, uncluttered visual language already established** (rounded cards, plain-language badges, no monospace/jargon on user-facing text) — this pass is about information architecture and honesty, not re-skinning colors again.

---

## 2. Global Design System (carried over, lightly extended)

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F7F8FB` | Page background |
| `--card` | `#FFFFFF` | Cards, rows |
| `--ink` | `#1B1F2A` | Primary text |
| `--ink-muted` | `#6B7280` | Secondary text |
| `--hairline` | `#E7E9EF` | Borders |
| `--blue` | `#3B67F5` | Primary actions, active nav |
| `--green` | `#178A56` | Success / finished / healthy |
| `--amber` | `#B8760A` | Partial / needs attention |
| `--red` | `#D3454B` | Failed / broken |
| `--radius` | `14px` | Cards |

**New addition needed for this pass — a "stale/empty" tone**, distinct from red (which means "broken") and amber (which means "partially done"):

| Token | Value | Use |
|---|---|---|
| `--slate` | `#8B93A7` | Text/icons for "nothing here yet" states — calmer than red, doesn't imply an error |
| `--slate-soft` | `#F0F1F5` | Background for empty-state panels |

---

## 3. Page: Upload / Home

Mostly working well in the current screenshot — a few refinements:

- The "Top 500 Enterprise Hiring Intelligence" pill at the top is a good hook; keep it, but make it a real link to the Top 500 Crawls page's current health (e.g. it could read **"Top 500 Enterprise Hiring — 12 companies live"** dynamically, rather than static marketing copy, so it's honest immediately rather than a separate page revealing a smaller number later).
- "Roles you're a strong fit for" section: add a visible **confidence percentage** next to each match tag (`Best match · 91%`), not just the qualitative label — you removed the raw percentage in the last redesign for simplicity, but given the duplicate-match bug, showing the number back openly makes it much easier for *you* to visually catch when something's wrong (two resumes both showing exactly `91%` for the same role is a much stronger red flag than two resumes both saying "Best match").

```
┌─────────────────────────────────────────────┐
│  Best match · 91%                            │
│  Java Backend Engineer                       │
│  Strong keyword match for Java, Spring...    │
│  [Java] [Spring Boot] [REST API] [PostgreSQL]│
└─────────────────────────────────────────────┘
```

---

## 4. Page: My Scans — Redesign

### 4.1 Fix the filename display

```
Before:  scan_22181a24.pdf
After:   Shri Ram Prince Mishra Resume.pdf
         (internal ref: scan_22181a24 — shown only on hover/tooltip, not as the primary label)
```

Pull `resumes.original_filename` via the join already available (`scans.resume_id → resumes.id`) rather than defaulting to the scan's own identifier. If `original_filename` is ever genuinely missing, fall back to `"Untitled resume · uploaded {date}"` — never an internal UUID-based string, since that's implementation detail leaking into a user-facing screen.

### 4.2 Fix (or expose) the duplicate best-match problem

Two options, and the redesign should support the second one as a real feature, not just a bug workaround:

**Option A — actually fix the classification bug** (backend issue, out of scope for a design doc, but the design should make it visible: show the confidence percentage per row, not just the role name, so identical values across different resumes are immediately visible to you as the developer, per §3).

**Option B — the row itself should show enough distinguishing detail that even a repeated role title doesn't look like an error.** Add a one-line reason snippet, matching the resume detail page pattern:

```
┌────────────────────────────────────────────────────────────────┐
│  Shri Ram Prince Mishra Resume.pdf              [Finished]      │
│  Uploaded Aug 12                                                 │
│  Best match: Senior Backend Engineer · 88%                       │
│  "5 years of Java, Spring Boot, and distributed systems exp."    │
│                                                    [View results] │
└────────────────────────────────────────────────────────────────┘
```

That reasoning line comes from the same `match_reason` field already generated per scan — surfacing it here costs nothing extra to compute and makes each row feel individually evaluated even before a user clicks in.

### 4.3 Filter tabs

Current tabs (`All / Finished / Partial / Needs attention`) are good — keep them, but wire the counts into the tab labels themselves (`Finished (44)`, `Partial (3)`, `Needs attention (4)`), following the same "no orphaned numbers" rule — a bare word tab with no count invites exactly the kind of silent mismatch seen in §0.

---

## 5. Page: Top 500 Crawls — Full Redesign

This page needs the most work. Redesigned into three honest sections instead of the current stat-cards-then-empty-lists layout.

### 5.1 Status header — numbers that can't contradict each other

Replace the four disconnected stat cards with **one summary line derived from the same query as the list below it**:

```
┌──────────────────────────────────────────────────────────────┐
│  Top 500 Enterprise Screening                                  │
│  Last run: Today, 12:00 PM · 12 of 500 companies connected     │
│  36 open roles found across those 12 companies                 │
│                                        [ ▶ Run screening now ]  │
└──────────────────────────────────────────────────────────────┘
```

Notice: **"12 of 500"**, not just "12" — this is the single most important honesty fix on this page. Right now "Active Portals: 12" reads like a healthy metric; "12 of 500 companies connected" immediately and correctly communicates that this is early/partial coverage, which is the truth, and sets the right expectation instead of implying the system is further along than it is.

### 5.2 Monitored Enterprise Portals — must never render empty silently

If `companies` has rows but none have successful crawl results yet, show them **with their real status**, not nothing:

```
┌───────────┬───────────┬───────────┬───────────┬───────────┐
│ Microsoft │ Amazon    │ Google    │ Meta      │ Apple     │
│ ● 6 roles │ ○ pending │ ○ pending │ ● 8 roles │ ✕ blocked │
│ found     │           │           │ found     │ (retry    │
│           │           │           │           │ tomorrow) │
└───────────┴───────────┴───────────┴───────────┴───────────┘
```

Three states per portal tile, matching the `crawl_results.status` values already in your schema:

| State | Dot | Meaning shown to user |
|---|---|---|
| Success | `●` green | "N roles found", last crawled time |
| Pending / not yet run | `○` slate | "pending — included in next run" |
| Blocked / failed | `✕` red | "blocked (retry tomorrow)" or "temporarily unavailable" |

This turns the current blank `Monitored Enterprise Portals` heading-with-nothing-under-it into an actual status board — which is far more useful to you personally for debugging the crawler than an empty section, and far more trustworthy to an end user than silence.

### 5.3 Live Direct Enterprise Openings — real empty state

If the list truly has zero results (e.g. right after a fresh deploy, before the first crawl has run), design the empty state explicitly instead of leaving a bare `(0)` heading:

```
┌──────────────────────────────────────────────────────────┐
│              🕐  No openings indexed yet                   │
│     The first screening run happens today at 12:00 PM.    │
│     You can also run one manually right now.              │
│                                    [ ▶ Run screening now ]  │
└──────────────────────────────────────────────────────────┘
```

Once real data exists, this section becomes the same role-grouped listing layout designed earlier (grouped by matched role, varied titles/salaries per company) — this empty-state design is specifically for the "nothing has run yet" moment, which your current screenshot is actually showing, just without a real message.

### 5.4 "Run Screening Crawl Now" — needs visible feedback

Right now this is a button with no visible state change implied in the screenshot. Redesign as a 3-state button:

```
Idle:      [ ▶ Run screening now ]
Running:   [ ⟳ Screening 12 companies… ]   (disabled while running)
Just ran:  [ ✓ Done — 3 new roles found ]  (reverts to idle after a few seconds)
```

This directly reflects the `crawl_runs` row created when the button is pressed — the button's label is driven by that row's `status`, not a static label, so a user (or you, testing) always knows whether a click actually did anything.

---

## 6. Page: Settings (not shown, but referenced in nav)

Not visible in your screenshots, so scoped light for this pass — recommend at minimum:

- Delete account / delete all resumes (ties to the GDPR erasure endpoint already built)
- Notification preference for daily crawl completion (optional, future)
- Display name / email (from `users` table)

---

## 7. Empty, Loading, and Error States — One Standard Across All Screens

Every list-bearing screen in the app (My Scans, Top 500 Crawls, job listings within a scan) should use the same three-state pattern, so the app feels consistent rather than each screen inventing its own blank-space behavior:

| State | Visual | Copy pattern |
|---|---|---|
| Loading | Skeleton rows (soft grey blocks, same shape as real rows) | — |
| Empty (nothing exists yet) | Icon + one sentence + a clear next action button | "No {thing} yet. {What to do about it}." |
| Error (something broke) | Red-toned small panel, not a full-page takeover | "Something went wrong loading {thing}. [Retry]" |

Applying this uniformly is what turns the current `Live Direct Enterprise Openings (0)` — which currently just looks broken — into a normal, expected part of using the product on day one.

---

## 8. Priority Order for Implementation

1. **Fix `original_filename` display in My Scans** — smallest change, immediate trust improvement.
2. **Fix or expose the duplicate-match-score bug** — add the percentage back to every role display so degenerate output is visible immediately during testing.
3. **Rebuild the Top 500 Crawls header as one derived summary line**, not four independent stat cards that can drift out of sync.
4. **Add real empty/pending/blocked states to the portal tiles** — replaces the blank section entirely.
5. **Wire the "Run Screening Crawl Now" button to real `crawl_runs` state** so it visibly does something.
6. Everything else (tab counts, confidence percentages on Upload results, Settings page) can follow after the above five, since those are the ones actively making the app look broken today.
