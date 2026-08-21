import os
import subprocess

def generate_html():
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Nous AI — Master Technical Interview & Defense Guide</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: A4 portrait;
    margin: 12mm 10mm 12mm 10mm;
    @bottom-right {
      content: "Page " counter(page);
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      color: #64748b;
    }
    @bottom-left {
      content: "Nous AI — Master Technical Defense, Architecture & Resume Guide";
      font-family: 'Inter', sans-serif;
      font-size: 7.5pt;
      color: #64748b;
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.45;
    font-size: 8.5pt;
    margin: 0;
    padding: 0;
  }

  /* Cover Page */
  .cover-page {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 36px 20px 20px 20px;
    background: linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #311042 100%);
    color: #ffffff;
    border-radius: 10px;
  }

  .badge-cover {
    display: inline-block;
    background: rgba(99, 102, 241, 0.25);
    color: #a5b4fc;
    border: 1px solid rgba(165, 180, 252, 0.4);
    padding: 5px 12px;
    border-radius: 18px;
    font-size: 8.5pt;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .cover-title {
    font-size: 28pt;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 10px 0;
    background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 60%, #a5b4fc 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .cover-subtitle {
    font-size: 11.5pt;
    color: #94a3b8;
    line-height: 1.45;
    max-width: 620px;
    margin-bottom: 20px;
  }

  .cover-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 20px 0;
  }

  .cover-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 10px 14px;
  }

  .cover-card h4 {
    margin: 0 0 4px 0;
    font-size: 9pt;
    color: #818cf8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cover-card p {
    margin: 0;
    font-size: 8pt;
    color: #cbd5e1;
    line-height: 1.35;
  }

  .cover-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: #64748b;
  }

  /* Headings */
  h1 {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    border-bottom: 2px solid #4f46e5;
    padding-bottom: 3px;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  h2 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #1e293b;
    border-left: 3px solid #6366f1;
    padding-left: 7px;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }

  h3 {
    font-size: 9pt;
    font-weight: 600;
    color: #334155;
    margin-top: 8px;
    margin-bottom: 3px;
    page-break-after: avoid;
  }

  p {
    margin-top: 0;
    margin-bottom: 5px;
    text-align: justify;
  }

  ul, ol {
    margin-top: 2px;
    margin-bottom: 5px;
    padding-left: 16px;
  }

  li {
    margin-bottom: 2px;
  }

  /* Callout Boxes */
  .callout {
    border-radius: 5px;
    padding: 7px 10px;
    margin: 6px 0;
    font-size: 8.2pt;
    page-break-inside: avoid;
  }

  .callout-info {
    background-color: #eff6ff;
    border-left: 3.5px solid #3b82f6;
    color: #1e40af;
  }

  .callout-success {
    background-color: #f0fdf4;
    border-left: 3.5px solid #22c55e;
    color: #166534;
  }

  .callout-title {
    font-weight: 700;
    margin-bottom: 2px;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 7.5pt;
    page-break-inside: avoid;
  }

  th {
    background-color: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 4.5px 6px;
    font-weight: 600;
    border: 1px solid #1e293b;
  }

  td {
    padding: 3.5px 6px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  tr:nth-child(even) {
    background-color: #f8fafc;
  }

  /* Diagram Box */
  .diagram-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 6px;
    margin: 6px 0;
    text-align: center;
    page-break-inside: avoid;
  }

  .diagram-box svg {
    max-width: 100%;
    height: auto;
  }

  /* Badges & Tags */
  .tag {
    display: inline-block;
    padding: 1px 4px;
    border-radius: 6px;
    font-size: 6.8pt;
    font-weight: 600;
    margin-right: 2px;
  }
  .tag-blue { background: #dbeafe; color: #1d4ed8; }
  .tag-green { background: #dcfce7; color: #15803d; }
  .tag-purple { background: #f3e8ff; color: #7e22ce; }
  .tag-orange { background: #ffedd5; color: #c2410c; }
  .tag-red { background: #fee2e2; color: #b91c1c; }

  /* Viva Cards */
  .viva-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 3px solid #4f46e5;
    border-radius: 5px;
    padding: 6px 9px;
    margin-bottom: 6px;
    page-break-inside: avoid;
    box-shadow: 0 1px 2px rgba(0,0,0,0.02);
  }

  .viva-q {
    font-size: 8.5pt;
    font-weight: 700;
    color: #1e1b4b;
    margin-bottom: 2px;
  }

  .viva-a {
    font-size: 7.9pt;
    color: #334155;
    line-height: 1.4;
  }

  .viva-tip {
    margin-top: 2px;
    padding: 2px 5px;
    background: #eef2ff;
    border-radius: 3px;
    font-size: 7pt;
    color: #4338ca;
    font-weight: 500;
  }

  .page-break {
    page-break-before: always;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 6px 0;
    page-break-inside: avoid;
  }

  .mini-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 6px 8px;
  }

  .mini-card h4 {
    margin: 0 0 2px 0;
    font-size: 8pt;
    color: #0f172a;
    font-weight: 700;
  }

  .mini-card p {
    margin: 0;
    font-size: 7.5pt;
    color: #475569;
    line-height: 1.3;
  }
</style>
</head>
<body>

<!-- PAGE 1: COVER PAGE -->
<div class="cover-page">
  <div>
    <span class="badge-cover">Official Master Technical Defense & Viva Reference</span>
    <h1 class="cover-title">NOUS AI</h1>
    <div class="cover-subtitle">
      Enterprise AI Resume Intelligence, Multi-Model Role Scoring & Real-Time Direct Career Portal Crawling Engine
    </div>
  </div>

  <div class="cover-grid">
    <div class="cover-card">
      <h4>1. Resilient Ingestion & Security</h4>
      <p>Apache Tika magic byte sniffing, ClamAV anti-malware TCP daemon, and SHA-256 deduplication.</p>
    </div>
    <div class="cover-card">
      <h4>2. Project-Heavy AI Recruiter</h4>
      <p>45% project architecture weighting; 3-tier cascade across Gemini Live, OpenAI, and local parser.</p>
    </div>
    <div class="cover-card">
      <h4>3. Direct Enterprise Crawling</h4>
      <p>Real-time ATS adapters (Greenhouse, Lever, Amazon, Uber) with soft-expiration and daily cron.</p>
    </div>
    <div class="cover-card">
      <h4>4. Reactive Streaming UX</h4>
      <p>Server-Sent Events (SSE) push streaming with 1500ms REST polling fallback in React 19.</p>
    </div>
  </div>

  <div class="cover-footer">
    <div><strong>Backend:</strong> Java 17, Spring Boot 3.3.4, PostgreSQL (Neon DB)</div>
    <div><strong>Frontend:</strong> React 19, Vite, Vanilla CSS</div>
    <div><strong>Purpose:</strong> Comprehensive Technical Viva, Architecture & Resume Defense</div>
  </div>
</div>

<!-- PAGE 2: EXECUTIVE SUMMARY & TECH STACK -->
<h1>1. Executive Summary & Spoken Elevator Pitch</h1>

<h2>1.1 The 30-Second Elevator Pitch (Word-for-Word for Interviews)</h2>
<div class="callout callout-info">
  <em>"Nous AI is an enterprise-grade resume intelligence platform and direct job discovery engine. Unlike traditional job boards that rely on shallow keyword matching and stale aggregators, Nous AI evaluates candidates like a Staff Recruiter—giving 45% weight to verified project architectures. It features a 3-tier zero-failure AI fallback cascade, crawls live corporate ATS portals directly (Amazon, Stripe, Uber) with SHA-256 deduplication, and streams real-time evaluation updates to a React 19 single-page dashboard using Server-Sent Events with an automatic polling fallback."</em>
</div>

<h2>1.2 Complete Technology Stack Matrix & Technical Rationale</h2>
<table>
  <thead>
    <tr>
      <th>Layer</th>
      <th>Technology</th>
      <th>Exact Version</th>
      <th>Architectural Responsibility & Interview Rationale</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Frontend UI</strong></td>
      <td>React + Vite</td>
      <td>React 19.0.0, Vite 5.x</td>
      <td>Fast SPA; sub-50ms client-side DOM rendering with zero server compilation overhead.</td>
    </tr>
    <tr>
      <td><strong>Styling</strong></td>
      <td>Vanilla CSS Tokens</td>
      <td>CSS3 Custom Props</td>
      <td>Custom dark theme (<code>#0f172a</code>, <code>#1e293b</code>), glassmorphism, responsive cards, zero CSS bundle bloat.</td>
    </tr>
    <tr>
      <td><strong>Backend Core</strong></td>
      <td>Java 17 + Spring Boot</td>
      <td>Spring Boot 3.3.4</td>
      <td>Dependency injection, thread pool management, non-blocking <code>@Async</code>, RFC 7807 problem details.</td>
    </tr>
    <tr>
      <td><strong>Concurrency Pool</strong></td>
      <td>ThreadPoolTaskExecutor</td>
      <td>Spring Core Async</td>
      <td><code>scanTaskExecutor</code> (Core: 4, Max: 10, Queue: 50) immediately frees Tomcat HTTP threads.</td>
    </tr>
    <tr>
      <td><strong>Real-Time Streaming</strong></td>
      <td>Server-Sent Events (SSE)</td>
      <td>Spring SseEmitter</td>
      <td>Unidirectional event streaming (<code>text/event-stream</code>) over HTTP without WebSocket overhead.</td>
    </tr>
    <tr>
      <td><strong>Persistence</strong></td>
      <td>PostgreSQL (Neon DB)</td>
      <td>PostgreSQL 16</td>
      <td>Relational consistency, cascade deletions, unique SHA-256 hash indexes, serverless cloud hosting.</td>
    </tr>
    <tr>
      <td><strong>Connection Pool</strong></td>
      <td>HikariCP</td>
      <td>5.1.0</td>
      <td>Tuned for cloud containers (<code>maxPoolSize=5</code>, <code>minIdle=2</code>, <code>idleTimeout=300000ms</code>, <code>prepareThreshold=0</code>).</td>
    </tr>
    <tr>
      <td><strong>MIME Security</strong></td>
      <td>Apache Tika</td>
      <td>2.9.2</td>
      <td>Sniffs true magic bytes in file headers, blocking spoofed <code>.exe</code> files renamed as <code>.pdf</code>.</td>
    </tr>
    <tr>
      <td><strong>Text Extractors</strong></td>
      <td>Apache PDFBox & POI</td>
      <td>PDFBox 3.0.3, POI 5.3.0</td>
      <td>PDFBox extracts text with reading-order sorting; POI extracts XML text from <code>.docx</code> tables/paragraphs.</td>
    </tr>
    <tr>
      <td><strong>Anti-Malware</strong></td>
      <td>ClamAV Socket Client</td>
      <td>TCP Socket :3310</td>
      <td>Streams raw file bytes to ClamAV daemon prior to disk persistence.</td>
    </tr>
    <tr>
      <td><strong>AI Engine</strong></td>
      <td>Google Gemini & OpenAI</td>
      <td>gemini-flash-latest / gpt-4o-mini</td>
      <td>Project-weighted role prediction, strict JSON schema output, and 6-domain semantic fallback.</td>
    </tr>
    <tr>
      <td><strong>Web Scraping</strong></td>
      <td>Jsoup & RestTemplate</td>
      <td>Jsoup 1.17.2</td>
      <td>Directly queries official public ATS APIs (Greenhouse, Lever, Amazon) and Schema.org JSON-LD.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 3: RESUME WORD-BY-WORD DEFENSE GUIDE (BULLETS 1 & 2) -->
<h1>2. Resume Word-by-Word Defense Guide (Part 1)</h1>
<p>
This section unpacks the exact terminology written on your resume so you can explain every single word with complete technical depth:
</p>

<h2>📌 Resume Bullet Point 1:</h2>
<div class="callout callout-info">
  <em>"Built a full-stack AI resume platform using Spring Boot and React, delivering a smooth, real-time user experience via Server-Sent Events (SSE) with a reliable automatic polling fallback."</em>
</div>

<table>
  <thead>
    <tr>
      <th>Term on Resume</th>
      <th>Simple Meaning</th>
      <th>Exact Code Implementation in Nous AI</th>
      <th>What to Say in the Interview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Full-Stack</strong></td>
      <td>Both Frontend UI and Backend Server/Database.</td>
      <td>React 19 Frontend + Spring Boot 3.3.4 Backend + PostgreSQL (Neon DB).</td>
      <td><em>"I engineered the full application lifecycle—from React state hooks to Spring Boot controllers, async workers, and database schemas."</em></td>
    </tr>
    <tr>
      <td><strong>Spring Boot</strong></td>
      <td>Enterprise Java framework for backend REST APIs.</td>
      <td>Spring Boot 3.3.4 managing REST controllers, JPA persistence, thread pools, and RFC 7807 exceptions.</td>
      <td><em>"Spring Boot gave us production-grade dependency injection, asynchronous thread pool management, and robust error handling."</em></td>
    </tr>
    <tr>
      <td><strong>React</strong></td>
      <td>Interactive JavaScript library for building single-page UIs.</td>
      <td>React 19 with Vite, custom hooks (<code>useScanStatus</code>), filter sliders, and sub-50ms DOM updates with zero reloads.</td>
      <td><em>"React allowed us to build a reactive single-page dashboard with instant filter controls and real-time state transitions."</em></td>
    </tr>
    <tr>
      <td><strong>Real-Time UX</strong></td>
      <td>Live progress updates without clicking refresh.</td>
      <td>Progress stepper automatically advances (<code>PENDING</code> ➔ <code>PROCESSING</code> ➔ <code>COMPLETE</code>) on screen.</td>
      <td><em>"The UI reflects backend pipeline advancements instantly without freezing the browser or requiring manual refreshes."</em></td>
    </tr>
    <tr>
      <td><strong>Server-Sent Events (SSE)</strong></td>
      <td>Standard HTTP protocol for server-to-client unidirectional push.</td>
      <td>Spring <code>SseEmitter</code> streaming <code>text/event-stream</code> JSON packets over <code>/api/scans/:id/events</code> to browser <code>EventSource</code>.</td>
      <td><em>"SSE provides lightweight push streaming over standard HTTP with native browser reconnection and zero WebSocket protocol overhead."</em></td>
    </tr>
    <tr>
      <td><strong>Automatic Polling Fallback</strong></td>
      <td>Backup request mechanism if live stream is blocked.</td>
      <td><code>useScanStatus.js</code> catches SSE network errors and automatically polls <code>GET /api/scans/:id</code> every 1500ms.</td>
      <td><em>"If a corporate proxy or firewall blocks SSE streams, the React hook gracefully downgrades to 1500ms REST polling so the app never gets stuck."</em></td>
    </tr>
  </tbody>
</table>

<h2>📌 Resume Bullet Point 2:</h2>
<div class="callout callout-info">
  <em>"Designed a smart, LLM-powered role classifier using Google Gemini and a custom semantic fallback parser to accurately extract candidate skills and match them to ideal roles."</em>
</div>

<table>
  <thead>
    <tr>
      <th>Term on Resume</th>
      <th>Simple Meaning</th>
      <th>Exact Code Implementation in Nous AI</th>
      <th>What to Say in the Interview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>LLM-Powered</strong></td>
      <td>Driven by Large Language Models understanding natural language.</td>
      <td>Integrates Google Gemini Live REST API (<code>gemini-flash-latest</code>) and OpenAI <code>/chat/completions</code>.</td>
      <td><em>"We leverage generative LLMs to evaluate resume context, project descriptions, and technical architectures rather than dumb keyword counting."</em></td>
    </tr>
    <tr>
      <td><strong>Role Classifier</strong></td>
      <td>AI module predicting top 3 matching job titles.</td>
      <td>Outputs Rank 1, 2, 3 roles with confidence scores (0.65–0.96), match reasons, and skill arrays.</td>
      <td><em>"The classifier acts as a Staff Recruiter, ranking the top 3 best-fitting corporate engineering roles with calibrated match percentages."</em></td>
    </tr>
    <tr>
      <td><strong>Google Gemini</strong></td>
      <td>Google's fast generative AI model family.</td>
      <td>Direct REST calls with model cascade (<code>gemini-flash-latest</code> ➔ <code>2.5-flash</code> ➔ <code>2.0-flash</code> ➔ <code>1.5-flash</code>).</td>
      <td><em>"We use Gemini Flash for sub-2-second structured JSON role evaluation with custom system prompt enforcement."</em></td>
    </tr>
    <tr>
      <td><strong>Custom Semantic Fallback Parser</strong></td>
      <td>Built-in local engine analyzing skills without external internet APIs.</td>
      <td>In-memory Java parser evaluating 6 domain clusters (Backend, AI/ML, Frontend, DevOps, Mobile, Data).</td>
      <td><em>"If external AI APIs fail or hit rate limits, our local parser scores domain clusters in 15ms with zero downtime."</em></td>
    </tr>
    <tr>
      <td><strong>Match to Ideal Roles</strong></td>
      <td>Scoring rubric connecting background to job titles.</td>
      <td>45% weight on Projects, 30% on Stack, 15% on Seniority, 10% on Tooling with 3x project weighting.</td>
      <td><em>"We apply a 3x score multiplier for technologies proven in real project architectures over static skill list mentions."</em></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 4: RESUME DEFENSE (BULLET 3) & SYSTEM ARCHITECTURE DIAGRAM -->
<h1>3. Resume Defense (Part 2) & System Architecture</h1>

<h2>📌 Resume Bullet Point 3:</h2>
<div class="callout callout-info">
  <em>"Engineered a secure, multi-threaded web crawler to aggregate live job postings from enterprise ATS systems, ensuring platform safety and data integrity through Apache Tika validation and SHA-256 deduplication."</em>
</div>

<table>
  <thead>
    <tr>
      <th>Term on Resume</th>
      <th>Simple Meaning</th>
      <th>Exact Code Implementation in Nous AI</th>
      <th>What to Say in the Interview</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Multi-Threaded Crawler</strong></td>
      <td>Background worker scraping multiple career sites simultaneously.</td>
      <td><code>CrawlOrchestratorService</code> on a 6-thread pool (<code>Executors.newFixedThreadPool(6)</code>) with 12s timeouts.</td>
      <td><em>"Crawls are parallelized across 6 worker threads with per-portal safety timeouts, preventing slow sites from blocking the batch."</em></td>
    </tr>
    <tr>
      <td><strong>Enterprise ATS Systems</strong></td>
      <td>Applicant Tracking Systems used by Fortune 500 tech companies.</td>
      <td>Adapters for Greenhouse API, Lever API, Amazon Jobs API, Uber API, and Jsoup Schema.org microdata.</td>
      <td><em>"We interface directly with public ATS endpoints (Greenhouse, Lever, Amazon) to guarantee 100% genuine apply links."</em></td>
    </tr>
    <tr>
      <td><strong>Platform Safety</strong></td>
      <td>Protecting server stability, resources, and upload safety.</td>
      <td>5MB size limit, Apache Tika byte inspection, and ClamAV TCP malware scanning.</td>
      <td><em>"Safety is maintained by verifying magic bytes before disk storage and scanning for malware over TCP socket."</em></td>
    </tr>
    <tr>
      <td><strong>Data Integrity</strong></td>
      <td>Keeping database accurate, non-duplicate, and consistent.</td>
      <td>Cascade deletes, foreign keys, unique constraints, and soft-expiration (<code>is_currently_open=false</code>).</td>
      <td><em>"Data integrity is enforced via relational constraints, composite hash deduplication, and automatic soft-expiration."</em></td>
    </tr>
    <tr>
      <td><strong>Apache Tika Validation</strong></td>
      <td>Inspecting binary magic bytes in file headers.</td>
      <td>Uses <code>Tika.detect()</code> on raw stream; rejects executables (<code>.exe</code>, <code>.sh</code>) disguised as <code>.pdf</code>.</td>
      <td><em>"Apache Tika reads file header magic bytes, preventing attackers from renaming malware executables to .pdf to bypass extension checks."</em></td>
    </tr>
    <tr>
      <td><strong>SHA-256 Deduplication</strong></td>
      <td>Cryptographic 256-bit hashing to identify identical files/jobs.</td>
      <td>Resumes: <code>SHA-256(fileBytes)</code> avoids duplicate storage. Jobs: <code>SHA-256(company:title:url)</code> prevents duplicate postings.</td>
      <td><em>"We use SHA-256 cryptographic digests for O(1) deduplication lookups, saving storage and preventing duplicate job entries."</em></td>
    </tr>
  </tbody>
</table>

<h2>3.2 System Architecture Diagram</h2>
<div class="diagram-box">
  <svg viewBox="0 0 760 170" width="100%" height="130" xmlns="http://www.w3.org/2000/svg">
    <!-- UI -->
    <rect x="10" y="15" width="150" height="145" rx="5" fill="#ffffff" stroke="#6366f1" stroke-width="1.5"/>
    <text x="85" y="32" font-family="Inter" font-size="8.5" font-weight="700" fill="#4338ca" text-anchor="middle">REACT 19 FRONTEND</text>
    <rect x="20" y="42" width="130" height="22" rx="3" fill="#eef2ff"/>
    <text x="85" y="56" font-family="Inter" font-size="7" fill="#312e81" text-anchor="middle">UploadZone (Drag & Drop)</text>
    <rect x="20" y="70" width="130" height="22" rx="3" fill="#eef2ff"/>
    <text x="85" y="84" font-family="Inter" font-size="7" fill="#312e81" text-anchor="middle">useScanStatus (SSE Hook)</text>
    <rect x="20" y="98" width="130" height="22" rx="3" fill="#eef2ff"/>
    <text x="85" y="112" font-family="Inter" font-size="7" fill="#312e81" text-anchor="middle">SuggestedRolesView</text>
    <rect x="20" y="126" width="130" height="22" rx="3" fill="#eef2ff"/>
    <text x="85" y="140" font-family="Inter" font-size="7" fill="#312e81" text-anchor="middle">JobListingsView</text>

    <!-- Backend -->
    <rect x="195" y="15" width="340" height="145" rx="5" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
    <text x="365" y="32" font-family="Inter" font-size="8.5" font-weight="700" fill="#0f172a" text-anchor="middle">SPRING BOOT 3.3.4 BACKEND (:8080)</text>
    
    <rect x="205" y="42" width="155" height="24" rx="3" fill="#f1f5f9"/>
    <text x="282" y="57" font-family="Inter" font-size="6.8" font-weight="600" fill="#0f172a" text-anchor="middle">ResumeController (/api/resumes)</text>

    <rect x="370" y="42" width="155" height="24" rx="3" fill="#f1f5f9"/>
    <text x="447" y="57" font-family="Inter" font-size="6.8" font-weight="600" fill="#0f172a" text-anchor="middle">ScanController (/api/scans)</text>

    <rect x="205" y="72" width="320" height="38" rx="3" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="365" y="86" font-family="Inter" font-size="7.2" font-weight="700" fill="#1e293b" text-anchor="middle">Async Orchestrator (scanTaskExecutor: 4-10 Workers)</text>
    <text x="365" y="99" font-family="Inter" font-size="6.5" fill="#475569" text-anchor="middle">Gemini Live / OpenAI / Semantic Parser · CompletableFuture Parallel Job Search</text>

    <rect x="205" y="116" width="320" height="38" rx="3" fill="#ede9fe" stroke="#a78bfa"/>
    <text x="365" y="130" font-family="Inter" font-size="7.2" font-weight="700" fill="#5b21b6" text-anchor="middle">Enterprise ATS Crawlers (6 Threads) & Pay Estimation Engine</text>
    <text x="365" y="143" font-family="Inter" font-size="6.5" fill="#4c1d95" text-anchor="middle">Greenhouse · Lever · Amazon · Uber · SHA-256 Deduplication · Daily Cron 12:00 PM</text>

    <!-- Cloud DB & APIs -->
    <rect x="565" y="15" width="185" height="145" rx="5" fill="#ffffff" stroke="#059669" stroke-width="1.5"/>
    <text x="657" y="32" font-family="Inter" font-size="8.5" font-weight="700" fill="#047857" text-anchor="middle">CLOUD SERVICES & DB</text>

    <rect x="575" y="42" width="165" height="32" rx="3" fill="#ecfdf5"/>
    <text x="657" y="56" font-family="Inter" font-size="7" font-weight="700" fill="#065f46" text-anchor="middle">PostgreSQL / Neon DB</text>
    <text x="657" y="67" font-family="Inter" font-size="6.2" fill="#047857" text-anchor="middle">resumes · scans · roles · job_postings</text>

    <rect x="575" y="80" width="165" height="32" rx="3" fill="#eff6ff"/>
    <text x="657" y="94" font-family="Inter" font-size="7" font-weight="700" fill="#1e40af" text-anchor="middle">AI Cloud APIs</text>
    <text x="657" y="105" font-family="Inter" font-size="6.2" fill="#1d4ed8" text-anchor="middle">Google Gemini REST · OpenAI / Groq</text>

    <rect x="575" y="118" width="165" height="34" rx="3" fill="#fef3c7"/>
    <text x="657" y="132" font-family="Inter" font-size="7" font-weight="700" fill="#92400e" text-anchor="middle">Live Corporate ATS</text>
    <text x="657" y="143" font-family="Inter" font-size="6.2" fill="#b45309" text-anchor="middle">Amazon · Stripe · Datadog · Uber</text>

    <!-- Connectors -->
    <path d="M 160 55 L 195 55" stroke="#4f46e5" stroke-width="1.5"/>
    <path d="M 195 85 L 160 85" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>
    <path d="M 535 55 L 565 55" stroke="#059669" stroke-width="1.5"/>
    <path d="M 535 95 L 565 95" stroke="#3b82f6" stroke-width="1.5"/>
    <path d="M 535 135 L 565 135" stroke="#f59e0b" stroke-width="1.5"/>
  </svg>
</div>

<div class="page-break"></div>

<!-- PAGE 5: CORE PIPELINES (INGESTION, AI, PAY ENGINE, CRAWLER) -->
<h1>4. Deep Dive: Core System Pipelines</h1>

<h2>4.1 Security Ingestion & Text Extraction (Phase 1)</h2>
<ol>
  <li><strong>MIME Header Sniffing:</strong> <code>FileValidationService</code> passes raw file streams to <strong>Apache Tika</strong>. Tika inspects binary header bytes, rejecting renamed executables (e.g. <code>malware.exe</code> renamed to <code>resume.pdf</code>) with <code>InvalidFileException</code> (HTTP 400).</li>
  <li><strong>SHA-256 Deduplication:</strong> <code>ResumeService</code> computes a SHA-256 hex digest. If already in PostgreSQL, it reuses the existing <code>Resume</code> record and attaches a new <code>Scan</code>, eliminating redundant disk writes.</li>
  <li><strong>ClamAV Virus Scanning:</strong> If enabled, file bytes stream over a TCP socket to ClamAV daemon (`localhost:3310`) prior to disk persistence.</li>
  <li><strong>Plain Text Extraction:</strong> PDF text is extracted with Apache PDFBox <code>PDFTextStripper(sortByPosition=true)</code>. DOCX text is extracted via Apache POI <code>XWPFWordExtractor</code>.</li>
</ol>

<h2>4.2 AI Role Intelligence & 3-Tier Fallback (Phase 2)</h2>
<p>
Nous AI evaluates candidates using a <strong>Staff Technical Recruiter</strong> rubric:
</p>
<div class="grid-2">
  <div class="mini-card">
    <h4>45% Project Architecture Weight</h4>
    <p>Heavily scores actual microservices, ML pipelines, and databases built in the Projects and Experience sections.</p>
  </div>
  <div class="mini-card">
    <h4>30% Technical Stack Mastery</h4>
    <p>Evaluates depth of core programming languages (Java, Python, TypeScript) and modern frameworks (Spring Boot, React).</p>
  </div>
</div>

<ul>
  <li><strong>Tier 1 (Google Gemini Live REST):</strong> Direct REST integration cascading across candidate models (<code>gemini-flash-latest</code> ➔ <code>gemini-2.5-flash</code> ➔ <code>gemini-2.0-flash</code>).</li>
  <li><strong>Tier 2 (OpenAI / Groq REST):</strong> Calls <code>/chat/completions</code> with structured JSON schema output mode.</li>
  <li><strong>Tier 3 (Dynamic Semantic Parser):</strong> In-memory Java parser evaluating 6 domain clusters with a <strong>3x weight multiplier (+0.18 points)</strong> for technologies verified inside the Projects section. Computes graduated confidence scores (0.65–0.96) in under 15ms.</li>
</ul>

<h2>4.3 Market Compensation Calibration Engine</h2>
<p>
<code>PayEstimationService</code> dynamically calibrates realistic salary bands across 4 vectors:
</p>
<ul>
  <li><strong>7 Geographic Regions & Currencies:</strong> India (<code>₹ Lakhs/yr</code>), US/Remote (<code>$ USD/yr</code>), UK (<code>£ GBP/yr</code>), Europe (<code>€ EUR/yr</code>), Canada (<code>CAD $/yr</code>), Singapore (<code>SGD $/yr</code>), Australia (<code>AUD $/yr</code>).</li>
  <li><strong>7 Seniority Tiers:</strong> Intern, Junior, Mid, Senior, Staff/Principal, Manager, Executive.</li>
  <li><strong>8 Domain Multipliers:</strong> AI/ML (1.20x), Security (1.15x), Backend/Infra (1.10x), Product (1.05x), General SWE (1.00x), Design (0.95x), Sales (0.90x), Business Ops (0.80x).</li>
</ul>

<h2>4.4 Enterprise Portal Crawling & ATS Scraping (Phase 3)</h2>
<ul>
  <li><strong>Official ATS Adapters:</strong> Connects to Greenhouse API, Lever API, Amazon Jobs search API, and Uber Careers.</li>
  <li><strong>Parallel Crawling Pool:</strong> 6 worker threads with a 12-second per-portal safety timeout.</li>
  <li><strong>Deduplication & Soft Expiration:</strong> Postings use composite <code>SHA-256(company_id:title:apply_url)</code>. Postings no longer listed during crawl runs are marked as <code>is_currently_open = false</code>.</li>
  <li><strong>Automated Daily Trigger:</strong> Runs daily at <strong>12:00 PM (Noon)</strong> via Spring's <code>@Scheduled(cron = "0 0 12 * * *")</code>.</li>
</ul>

<div class="page-break"></div>

<!-- PAGE 6: DATABASE SCHEMA & REST API REFERENCE -->
<h1>5. Database Schema & Complete REST API Catalog</h1>

<h2>5.1 Database Entity Relationship (ER) Model</h2>
<table>
  <thead>
    <tr>
      <th>Table Name</th>
      <th>Primary Key</th>
      <th>Key Columns & Constraints</th>
      <th>Relationship & Cascade Behavior</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>resumes</code></td>
      <td><code>id UUID</code></td>
      <td><code>file_hash (UK)</code>, <code>user_id</code>, <code>mime_type</code>, <code>extracted_text (TEXT)</code></td>
      <td>Root candidate record. Deletion cascades to scans and files.</td>
    </tr>
    <tr>
      <td><code>scans</code></td>
      <td><code>id UUID</code></td>
      <td><code>resume_id (FK)</code>, <code>status (ENUM)</code>, <code>created_at</code>, <code>completed_at</code></td>
      <td>Belongs to <code>resumes</code>. Cascade deletes roles & job listings.</td>
    </tr>
    <tr>
      <td><code>suggested_roles</code></td>
      <td><code>id UUID</code></td>
      <td><code>scan_id (FK)</code>, <code>role_title</code>, <code>rank_order</code>, <code>confidence_score</code></td>
      <td>Stores top 3 AI evaluated roles with verified skills CSV.</td>
    </tr>
    <tr>
      <td><code>job_listings</code></td>
      <td><code>id UUID</code></td>
      <td><code>scan_id (FK)</code>, <code>role_id (FK)</code>, <code>title</code>, <code>company</code>, <code>apply_url</code></td>
      <td>Matched job openings linked to specific target roles.</td>
    </tr>
    <tr>
      <td><code>companies</code></td>
      <td><code>id UUID</code></td>
      <td><code>name (UK)</code>, <code>adapter_type</code>, <code>adapter_config</code>, <code>is_active</code></td>
      <td>Monitored enterprise portals (Stripe, Amazon, Datadog, etc.).</td>
    </tr>
    <tr>
      <td><code>job_postings</code></td>
      <td><code>id UUID</code></td>
      <td><code>company_id (FK)</code>, <code>posting_hash (UK)</code>, <code>is_currently_open</code></td>
      <td>Scraped live enterprise openings with soft-expiration.</td>
    </tr>
    <tr>
      <td><code>crawl_runs</code></td>
      <td><code>id UUID</code></td>
      <td><code>started_at</code>, <code>completed_at</code>, <code>total_postings_found</code></td>
      <td>Daily crawl batch metrics and execution audits.</td>
    </tr>
    <tr>
      <td><code>crawl_results</code></td>
      <td><code>id UUID</code></td>
      <td><code>crawl_run_id (FK)</code>, <code>company_id (FK)</code>, <code>status</code>, <code>duration_ms</code></td>
      <td>Per-portal latency, error reason, and count metrics.</td>
    </tr>
  </tbody>
</table>

<h2>5.2 REST Endpoint Catalog & Status Codes</h2>
<table>
  <thead>
    <tr>
      <th>HTTP Method</th>
      <th>Endpoint Path</th>
      <th>Request Payload</th>
      <th>Status & Response Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>POST</code></td>
      <td><code>/api/resumes</code></td>
      <td><code>multipart/form-data</code> (file: PDF/DOCX, userId)</td>
      <td><code>202 Accepted</code>: Returns Resume metadata & active <code>scanId</code> (under 50ms).</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/resumes/{id}</code></td>
      <td>None (Path Variable)</td>
      <td><code>200 OK</code>: Returns metadata, character count, extracted text preview.</td>
    </tr>
    <tr>
      <td><code>DELETE</code></td>
      <td><code>/api/resumes/{id}</code></td>
      <td>None (Path Variable)</td>
      <td><code>204 No Content</code>: Cascades DB delete & removes physical file from disk.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/scans/{id}</code></td>
      <td>None (Path Variable)</td>
      <td><code>200 OK</code>: Returns scan status, top role title, and match confidence.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/scans/{id}/events</code></td>
      <td>None (Path Variable)</td>
      <td><code>text/event-stream</code> (SSE): Pushes real-time scan state changes.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/scans/{id}/roles</code></td>
      <td>None (Path Variable)</td>
      <td><code>200 OK</code>: Array of top 3 roles, scores, reasons, and skill arrays.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/scans/{id}/jobs</code></td>
      <td>None (Path Variable)</td>
      <td><code>200 OK</code>: Array of matched live job listings with apply URLs.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/crawler/companies</code></td>
      <td>None</td>
      <td><code>200 OK</code>: List of verified live monitored enterprise companies.</td>
    </tr>
    <tr>
      <td><code>POST</code></td>
      <td><code>/api/crawler/trigger</code></td>
      <td>None</td>
      <td><code>200 OK</code>: Initiates async batch crawl across all active portals.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/crawler/postings</code></td>
      <td><code>?query=java&limit=50</code></td>
      <td><code>200 OK</code>: Live search over all crawled open enterprise postings.</td>
    </tr>
    <tr>
      <td><code>GET</code></td>
      <td><code>/api/users/{id}/scans</code></td>
      <td>None (Path Variable)</td>
      <td><code>200 OK</code>: Full scan history across all resumes uploaded by user.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PAGE 7: MASTER INTERVIEW DEFENSE Q&A (CONCURRENCY, AI, SECURITY) -->
<h1>6. Master Technical Defense: Interview Questions & Answers</h1>

<div class="viva-card">
  <div class="viva-q">Q1: How does the asynchronous architecture prevent Tomcat request thread starvation?</div>
  <div class="viva-a">
    "When a user uploads a resume via <code>POST /api/resumes</code>, we do not execute the long-running AI role evaluation within the HTTP request thread. The controller validates the file, computes the SHA-256 hash, extracts plain text, initializes a <code>Scan</code> entity with status <code>PENDING</code>, and dispatches the task to our custom <code>scanTaskExecutor</code> thread pool (Core: 4, Max: 10, Queue: 50) using <code>@Async</code>. The controller immediately returns <code>HTTP 202 Accepted</code> in under 50ms, freeing the Tomcat thread to accept new requests."
  </div>
  <div class="viva-tip">💡 Core Concept: Non-blocking asynchronous execution, ThreadPoolTaskExecutor, HTTP 202 Accepted.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q2: Why did you choose Server-Sent Events (SSE) instead of WebSockets?</div>
  <div class="viva-a">
    "WebSockets provide full-duplex bi-directional communication, which introduces unnecessary protocol complexity (binary framing, handshake overhead, ping/pong heartbeats) for a flow that only requires unidirectional status updates from server to client. SSE runs over standard HTTP/1.1 and HTTP/2 (<code>text/event-stream</code>), traverses firewalls seamlessly, and includes native browser reconnection via <code>EventSource</code>. We also engineered a 1500ms REST polling fallback in <code>useScanStatus.js</code> if a corporate proxy blocks event streams."
  </div>
  <div class="viva-tip">💡 Core Concept: Unidirectional event streaming, native reconnection, graceful polling degradation.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q3: What is your 3-Tier AI Fallback Architecture and how does it guarantee 100% uptime?</div>
  <div class="viva-a">
    "1. <strong>Tier 1:</strong> Google Gemini Live REST API with model cascading (<code>gemini-flash-latest</code> ➔ <code>2.5-flash</code> ➔ <code>2.0-flash</code> ➔ <code>1.5-flash</code>).<br>
    2. <strong>Tier 2:</strong> OpenAI / Groq <code>/chat/completions</code> endpoint with JSON schema output mode.<br>
    3. <strong>Tier 3:</strong> In-memory <strong>Dynamic Semantic Parser</strong> evaluating 6 domain clusters with 3x project weighting in under 15ms. Even if all external cloud AI providers are offline, the system never fails."
  </div>
  <div class="viva-tip">💡 Core Concept: Fault tolerance, circuit breaker fallback, in-memory zero-API parsing.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q4: Why does Nous AI prioritize candidate projects (45%) over static skill lists (30%)?</div>
  <div class="viva-a">
    "Traditional ATS systems fail because candidates stuff 50 buzzwords into their skills section. Our system prompts Gemini to act as a Staff Technical Recruiter, prioritizing concrete implementations (e.g., Spring Boot microservices, Kafka pipelines, React frontends) built in the Projects and Experience sections. Technologies verified in projects receive a 3x weight multiplier."
  </div>
  <div class="viva-tip">💡 Core Concept: Staff Recruiter evaluation rubric, 3x project section weighting multiplier.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q5: How does the parallel job search execute across multiple roles during a scan?</div>
  <div class="viva-a">
    "In <code>ScanService.java</code>, once the top 3 roles are determined, we construct a list of <code>CompletableFuture.supplyAsync()</code> tasks. Each role queries the job repository and pay calibration engine concurrently on separate worker threads. We use <code>CompletableFuture.allOf().join()</code> to aggregate all listings. This cuts job search latency from $3 \times 400\text{ms} = 1.2\text{s}$ down to under $400\text{ms}$ total."
  </div>
  <div class="viva-tip">💡 Core Concept: Java Concurrency, CompletableFuture parallelization, sub-second aggregation.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q6: How do you prevent malicious or fake file uploads?</div>
  <div class="viva-a">
    "We enforce 3 layers of security: (1) <strong>Size enforcement:</strong> 5MB limit enforced at multipart and service layer. (2) <strong>Magic-Byte Sniffing:</strong> Apache Tika reads the true file header bytes, preventing executable files (e.g., <code>virus.exe</code>) renamed to <code>resume.pdf</code> from being processed. (3) <strong>Anti-Malware:</strong> File bytes are streamed over a TCP socket to a ClamAV daemon (<code>localhost:3310</code>) prior to disk persistence."
  </div>
  <div class="viva-tip">💡 Core Concept: Apache Tika magic-byte detection, ClamAV daemon TCP streaming, zero-trust file validation.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q7: How does SHA-256 deduplication work in code?</div>
  <div class="viva-a">
    "Upon receiving the file bytes, <code>ResumeService.java</code> calculates a SHA-256 hex digest (<code>MessageDigest.getInstance(\"SHA-256\")</code>). We perform an indexed lookup in PostgreSQL on <code>resumes.file_hash</code>. If a match is found, we skip writing the file to disk and re-extracting text, immediately reusing the existing <code>Resume</code> record and creating a new <code>Scan</code> instance."
  </div>
  <div class="viva-tip">💡 Core Concept: Cryptographic hashing, idempotent storage, B-Tree index optimization.</div>
</div>

<div class="page-break"></div>

<!-- PAGE 8: ADVANCED INTERVIEW DEFENSE & CLOSING -->
<h1>7. Advanced Technical Defense & Architectural Trade-offs</h1>

<div class="viva-card">
  <div class="viva-q">Q8: How does the Pay Estimation Engine calculate compensation across different currencies?</div>
  <div class="viva-a">
    "The engine uses a 4-tier matrix: (1) Geo-location detection maps the job to one of 7 regions (e.g., Bangalore ➔ India INR, London ➔ UK GBP). (2) Title analysis classifies seniority into 7 tiers (Intern to Executive). (3) Domain analysis applies multiplier weights (e.g., AI/Data is 1.20x, Distributed Systems is 1.10x). (4) The output is formatted in clean localized currency units (e.g., <code>₹38L - ₹65L / yr</code> for India or <code>$185,000 - $255,000 / yr</code> for the US)."
  </div>
  <div class="viva-tip">💡 Core Concept: Multi-factor compensation matrix, localized currency formatting, domain multipliers.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q9: How does the crawler fetch real jobs from enterprise companies and handle closed jobs?</div>
  <div class="viva-a">
    "We implemented modular career adapters: <code>GreenhouseAdapter</code> and <code>LeverAdapter</code> query official public REST APIs; <code>AmazonJobsAdapter</code> queries the official Amazon Jobs search API; <code>UberAdapter</code> queries internal career endpoints; and <code>GenericHtmlAdapter</code> parses Schema.org JSON-LD microdata using Jsoup. Each job posting is assigned a composite SHA-256 hash (<code>company_id:title:apply_url</code>). When a daily crawl completes, any posting not observed during the latest run is soft-expired by setting <code>is_currently_open = false</code>."
  </div>
  <div class="viva-tip">💡 Core Concept: Public ATS APIs, composite SHA-256 deduplication, soft-expiration lifecycle.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q10: What database indexes exist and why?</div>
  <div class="viva-a">
    "1. <code>resumes.file_hash</code>: Unique B-Tree index for $O(1)$ resume deduplication lookups.<br>
    2. <code>job_postings.posting_hash</code>: Unique B-Tree index for $O(1)$ crawler upserts and deduplication.<br>
    3. Foreign key indexes on <code>scans.resume_id</code>, <code>suggested_roles.scan_id</code>, and <code>job_listings.scan_id</code> for fast join and cascade operations."
  </div>
  <div class="viva-tip">💡 Core Concept: Database indexing, B-Tree index structure, foreign key constraints.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q11: How did you configure HikariCP for serverless cloud databases (Neon DB)?</div>
  <div class="viva-a">
    "Serverless containers have strict memory limits and connection pooling boundaries. In <code>application.properties</code>, we configured: <code>maximum-pool-size = 5</code>, <code>minimum-idle = 2</code>, <code>idle-timeout = 300000ms</code>, <code>max-lifetime = 900000ms</code>, and <code>prepareThreshold = 0</code> to prevent connection exhaustion."
  </div>
  <div class="viva-tip">💡 Core Concept: HikariCP pool tuning, Neon DB serverless, connection leak prevention.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q12: How are exceptions mapped to HTTP responses across the backend?</div>
  <div class="viva-a">
    "We implemented <code>GlobalExceptionHandler.java</code> using <code>@RestControllerAdvice</code>. All business exceptions (<code>InvalidFileException</code>, <code>ResumeNotFoundException</code>, <code>VirusScanException</code>, <code>LlmExtractionException</code>) are transformed into standardized RFC 7807 <code>ProblemDetail</code> JSON responses with appropriate HTTP status codes (400, 404, 422, 500)."
  </div>
  <div class="viva-tip">💡 Core Concept: RFC 7807 ProblemDetail, @RestControllerAdvice, uniform error handling.</div>
</div>

<div class="viva-card">
  <div class="viva-q">Q13: What happens when a user deletes a resume? How is data privacy enforced?</div>
  <div class="viva-a">
    "We enforce full Right-to-Erasure compliance. When <code>DELETE /api/resumes/{id}</code> is called, <code>ResumeService</code> and <code>ScanService</code> perform a transactional cascade delete: all child <code>job_listings</code>, <code>suggested_roles</code>, and <code>scans</code> records are removed from PostgreSQL, followed by the physical file being unlinked from disk storage."
  </div>
  <div class="viva-tip">💡 Core Concept: GDPR/Right-to-Erasure, transactional cascade deletion, physical file unlinking.</div>
</div>

<!-- SUMMARY & CLOSING -->
<div style="background: #0f172a; color: #ffffff; border-radius: 6px; padding: 10px 14px; margin-top: 6px;">
  <h3 style="color: #a5b4fc; margin-top: 0; font-size: 9pt;">Final Defense Summary Statement</h3>
  <p style="font-size: 7.9pt; color: #cbd5e1; margin-bottom: 0; line-height: 1.35;">
    <strong>Nous AI</strong> represents an enterprise demonstration of full-stack software engineering. It combines zero-trust security ingestion, non-blocking asynchronous concurrency, multi-tier AI fallback reliability, direct corporate ATS integration, and real-time streaming UX into an end-to-end cloud platform. Every architectural choice—from Apache Tika byte inspection to SSE streaming and HikariCP connection tuning—was engineered for speed, fault-tolerance, and scale.
  </p>
</div>

</body>
</html>"""
    return html_content

def build_pdf():
    html_path = "d:/nous/temp_doc.html"
    pdf_path = "d:/nous/Nous_AI_Complete_Project_Documentation_and_Viva_Guide.pdf"
    
    html = generate_html()
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--no-sandbox",
        "--allow-file-access-from-files",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        f"file:///{html_path.replace(chr(92), '/')}"
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    print("Chrome exit code:", res.returncode)
    
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: Master 8-Page PDF generated at {pdf_path} (Size: {size_kb:.2f} KB)")
    
    if os.path.exists(html_path):
        os.remove(html_path)

if __name__ == "__main__":
    build_pdf()
