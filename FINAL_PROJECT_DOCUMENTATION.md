# Nous AI — Resume Intelligence & Job Finder
## Final Project Technical & System Overview

> **Nous AI** is an enterprise-grade, asynchronous AI resume scanner and job matching engine. Candidates upload their resumes (PDF or DOCX), and the system validates security, extracts candidate text, uses Large Language Models (LLM) to infer optimal target job roles, queries live external job board APIs and enterprise hiring portals, and aggregates matched open positions.

---

## 1. What the System Is Doing Right Now

The system runs a **6-phase asynchronous processing pipeline** connecting a Spring Boot backend and a React frontend:

```mermaid
graph TD
    User[React Frontend Client] -->|1. POST /api/resumes (Multipart Upload)| Controller[Spring Boot ResumeController]
    Controller -->|2. Sniff MIME, Scan Virus, Compute Hash| Security[Validation & Virus Service]
    Security -->|3. Check SHA-256 Dedupe| ResumeRepo[(PostgreSQL / H2 Storage)]
    Controller -->|4. Return 202 Accepted + scanId| User
    Controller -->|5. Trigger Async Worker| Worker[ScanService @Async Worker]
    Worker -->|6. Extract Plaintext| Extractor[PDFBox / Apache POI]
    Worker -->|7. Infer Target Roles| LLM[LLM API / Heuristic Fallback]
    Worker -->|8. Fetch Live Jobs| JobAPIs[Adzuna / JSearch / Top 500 Engine]
    Worker -->|9. Persist Roles & Listings| DB[(Normalized DB Tables)]
    User -->|10. Stream Live Status via SSE / Poll| SSE[GET /api/scans/{id}/events]
```

### Core Features Implemented:

1. **Security-First File Ingestion & Parsing**:
   - **MIME Sniffing**: Uses Apache Tika to inspect magic bytes directly, preventing file extension spoofing.
   - **Virus Inspection**: Integrates ClamAV daemon client (`ClamAvVirusScanner.java`) with a graceful fallback scanner (`NoOpVirusScanner.java`).
   - **Deduplication Engine**: Calculates SHA-256 content hashes to detect duplicate uploads instantly and bypass redundant LLM operations.
   - **Text Extraction**: Uses Apache PDFBox (PDF) and Apache POI (DOCX) for reliable plaintext parsing.

2. **Asynchronous Non-Blocking Processing Pipeline**:
   - Converts heavy operations (LLM classification and external API calls) into background execution threads (`@Async("scanTaskExecutor")`).
   - Returns HTTP `202 Accepted` immediately upon upload so client threads are never blocked.
   - Implements a resilient 5-stage status machine: `PENDING` ➔ `PROCESSING` ➔ `COMPLETE` / `PARTIAL` / `FAILED`.

3. **Real-Time Server-Sent Events (SSE) & Fallback Polling**:
   - Exposes `GET /api/scans/{scanId}/events` returning a live `text/event-stream` (`SseEmitter`).
   - Frontend `useScanStatus` hook uses `EventSource` to receive real-time server pushes, with automatic fallback to 1500ms HTTP polling if SSE is disconnected.

4. **AI Role Intelligence & Target Classification**:
   - Prompts LLM for strict JSON schema output (`roleTitle`, `rank`, `confidenceScore`, `matchReason`, `keySkills`).
   - Includes schema validation, timeout protection, and heuristic offline fallback logic when API keys are unconfigured.

5. **Multi-Source Job Search & Enterprise Crawler**:
   - Integrates Adzuna API, JSearch API, Top 500 Enterprise Hiring Portal Crawler, and a synthetic fallback engine.
   - Executes parallel job queries per role and normalizes results into standard job listing entities.
   - Supports explicit `PARTIAL` status if 1 role search succeeds while another encounters partial timeouts.

6. **Privacy Compliance & Right to Erasure (GDPR/CCPA)**:
   - Exposes `DELETE /api/resumes/{id}` which physically removes stored resume files from disk and performs cascading database cleanup of scans, roles, and job listings.

7. **Premium Modern UI/UX (React + Vanilla CSS)**:
   - Built with an Asana-inspired design system using CSS custom properties, smooth transitions, circular progress wheels, and high-contrast status badges (`COMPLETE`, `PARTIAL`, `FAILED`).
   - Interactive role filtering, location search, platform tabs, candidate plaintext view, and scan history audit filters (`All`, `Finished`, `Partial`, `Needs attention`).

---

## 2. Technology Stack

### Backend
- **Language**: Java 17
- **Framework**: Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Async)
- **Database**: PostgreSQL (Production) / H2 In-Memory DB (Dev & Testing)
- **Document Extractors**: Apache PDFBox 3.0, Apache POI 5.3, Apache Tika 2.9
- **Virus Scanning**: fi.solita.clamav:clamav-client 1.0.1
- **Utilities**: Lombok, Spring Dotenv (`spring-dotenv`)

### Frontend
- **Framework**: React 19 (Hooks, Custom Hooks)
- **Build Tool**: Vite 8.2
- **Styling**: Vanilla CSS3 (Custom Design Tokens, Micro-animations, Glassmorphism)
- **Real-time Protocol**: Server-Sent Events (EventSource API)

---

## 3. Database Schema

The database model is fully normalized for analytical querying:

- **`users`**: Candidate identity records (`id`, `email`, `name`, `created_at`).
- **`resumes`**: Uploaded file metadata (`id`, `user_id`, `original_filename`, `mime_type`, `file_hash`, `stored_file_path`, `extracted_text`, `uploaded_at`).
- **`scans`**: Execution tracking (`id`, `resume_id`, `status`, `error_reason`, `created_at`, `completed_at`).
- **`suggested_roles`**: AI classification outputs (`id`, `scan_id`, `role_title`, `rank_order`, `confidence_score`, `match_reason`, `key_skills_csv`, `created_at`).
- **`job_listings`**: Matched enterprise job openings (`id`, `scan_id`, `role_id`, `title`, `company`, `location`, `salary_range`, `apply_url`, `source_api`, `fetched_at`).
- **`companies`**: Top 500 enterprise hiring entities (`id`, `name`, `domain`, `careers_url`, `industry`).
- **`crawl_runs` / `crawl_results` / `job_postings`**: Automated enterprise hiring portal crawler entities.

---

## 4. API Specification

| HTTP Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/resumes` | Upload resume file (PDF/DOCX). Returns `202 Accepted` + `scanId`. |
| `GET` | `/api/resumes/{id}` | Fetch resume metadata and latest scan status. |
| `GET` | `/api/resumes/{id}/text` | Fetch parsed plaintext extracted from resume. |
| `DELETE` | `/api/resumes/{id}` | Permanently delete file from disk and cascade delete DB records. |
| `GET` | `/api/scans/{scanId}` | Poll scan execution status. |
| `GET` | `/api/scans/{scanId}/events` | **SSE Stream**: Real-time status event push (`text/event-stream`). |
| `GET` | `/api/scans/resume/{resumeId}` | List all scans associated with a resume UUID. |
| `GET` | `/api/scans/{scanId}/roles` | Fetch AI suggested target job roles for a scan. |
| `GET` | `/api/scans/{scanId}/jobs` | Fetch live job search listings for a scan. |
| `GET` | `/api/users/{userId}/scans` | Fetch scan history for a user. |
| `GET` | `/api/crawler/companies` | List Top 500 enterprise hiring directory companies. |
| `POST` | `/api/crawler/run` | Trigger enterprise portal crawler screening run. |

---

## 5. System Status & Verification

- **Backend Unit & Integration Tests**: 51 / 51 tests passing (`.\mvnw.cmd test` — `BUILD SUCCESS`).
- **Frontend Linter**: 0 errors (`npm run lint`).
- **Frontend Production Bundle**: Built successfully (`npm run build`).
- **Local Dev Servers**:
  - Backend: Running on [http://localhost:8080](http://localhost:8080)
  - Frontend: Running on [http://localhost:5173](http://localhost:5173)
