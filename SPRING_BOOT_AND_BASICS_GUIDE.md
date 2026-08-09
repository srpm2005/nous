# 📘 Spring Boot & Full-Stack Prerequisites & Basics Guide — Nous AI Resume Engine

Welcome to the **Complete Prerequisites & Fundamental Concepts Guide** for the **Nous AI Resume Engine** project. 

If you are learning Java, Spring Boot, databases, Maven, Git, or Web APIs from scratch, this guide breaks down **every foundational concept, tool, prerequisite, and annotation** used in this project in clear, simple terms.

---

## 📋 Table of Contents

1. [📦 1. Build Tools & Maven Basics (pom.xml & Wrapper)](#1-build-tools--maven-basics-pomxml--wrapper)
2. [☕ 2. Core Java 17 Prerequisites & Features](#2-core-java-17-prerequisites--features)
3. [🌱 3. Spring Boot Core Concepts & Annotations](#3-spring-boot-core-concepts--annotations)
4. [🌐 4. HTTP Protocols, REST APIs & Web Basics](#4-http-protocols-rest-apis--web-basics)
5. [🔒 5. Environment Variables & Secrets Management (.env)](#5-environment-variables--secrets-management-env)
6. [🗄️ 6. Database, SQL Indexes & Spring Data JPA Basics](#6-database-sql-indexes--spring-data-jpa-basics)
7. [🧰 7. Essential Libraries Used (Lombok, PDFBox, POI, Tika, Jackson)](#7-essential-libraries-used-lombok-pdfbox-poi-tika-jackson)
8. [⚛️ 8. React 19, JavaScript ES6 & Frontend Basics](#8-react-19-javascript-es6--frontend-basics)
9. [🌿 9. Git Version Control & .gitignore Rules](#9-git-version-control---gitignore-rules)
10. [❓ 10. Beginner Q&A for Technical Interviews](#10-beginner-qa-for-technical-interviews)

---

## 1. 📦 Build Tools & Maven Basics (pom.xml & Wrapper)

### 1.1 What is Apache Maven?
Maven is a build automation tool for Java applications. Instead of downloading `.jar` library files manually, Maven manages all dependencies, compiles source code, runs automated tests, and packages the application into an executable JAR.

### 1.2 Understanding `pom.xml` (Project Object Model)
Every Maven project has a `pom.xml` file at its root:
- `groupId`: Uniquely identifies your organization/package (`com.project`).
- `artifactId`: The unique name of your project (`nous`).
- `version`: Current version of your software (`0.0.1-SNAPSHOT`).
- `<dependencies>`: List of external libraries required by your application.

```xml
<!-- Example dependency from pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### 1.3 What is the Maven Wrapper (`mvnw` / `mvnw.cmd`)?
- The **Maven Wrapper** allows developers to run Maven commands **without installing Maven globally** on their computer.
- Running `.\mvnw.cmd test` (Windows) or `./mvnw test` (Linux/Mac) uses the exact wrapper binary bundled with the repository.

### 1.4 Common Maven Lifecycle Commands
- `.\mvnw.cmd compile`: Compiles all Java source code files.
- `.\mvnw.cmd test`: Runs the automated test suite (Surefire plugin).
- `.\mvnw.cmd spring-boot:run`: Compiles and starts the Spring Boot backend server on port 8080.
- `.\mvnw.cmd package`: Packages the project into a deployable JAR file in the `target/` directory.

---

## 2. ☕ Core Java 17 Prerequisites & Features

### 2.1 Java 17 Records (Immutable Data Carriers)
Records generate transparent data containers with automatic getters, `equals()`, `hashCode()`, and `toString()`.
```java
// Example from AdzunaJobClient.java
public record AdzunaResponse(List<AdzunaResult> results) {}
public record AdzunaResult(String title, AdzunaCompany company, Double salaryMin, Double salaryMax, String redirectUrl) {}
public record AdzunaCompany(String displayName) {}
```

### 2.2 Streams API (`map`, `filter`, `collect`)
Allows functional manipulation of collections:
```java
// Filter roles by min score and convert entities to DTOs
List<RoleSuggestionDto> dtos = roles.stream()
        .filter(r -> r.getConfidenceScore() >= 0.75)
        .map(this::mapToRoleDto)
        .collect(Collectors.toList());
```

### 2.3 `java.util.UUID` & `Instant`
- `UUID`: 128-bit random identifier (e.g. `bf384dd7-64ea-487e-848d-d7022d358e5d`). Prevents sequential ID guessing attacks.
- `Instant`: Instantaneous UTC timestamp (`Instant.now()`).

### 2.4 Try-With-Resources
Objects implementing `AutoCloseable` inside a `try(...)` block are automatically closed when done, preventing memory leaks:
```java
try (PDDocument document = Loader.loadPDF(fileBytes)) {
    PDFTextStripper stripper = new PDFTextStripper();
    return stripper.getText(document);
}
```

---

## 3. 🌱 Spring Boot Core Concepts & Annotations

### 3.1 What is Spring Boot?
Spring Boot simplifies Spring development via **Auto-Configuration** (automatically setting up components) and an **Embedded Tomcat Web Server** (listening on port 8080).

### 3.2 Inversion of Control (IoC) & Dependency Injection (DI)
Spring manages instances of your classes (called **Spring Beans**). Instead of creating dependencies manually via `new Service()`, Spring automatically injects required beans into constructors.

### 3.3 Core Spring Annotations Reference

| Annotation | Description | Example |
| :--- | :--- | :--- |
| `@SpringBootApplication` | Entry point combining `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan`. | `NousApplication.java` |
| `@RestController` | HTTP REST endpoint handler returning JSON. | `ScanController.java` |
| `@Service` | Class holding core business logic. | `ScanService.java` |
| `@Repository` | Interface for database queries via Spring Data JPA. | `ScanRepository.java` |
| `@Configuration` | Class containing `@Bean` factory methods. | `AsyncConfig.java` |
| `@Value` | Injects config property values from `application.properties` / `.env`. | `@Value("${app.upload.max-size}")` |
| `@ConditionalOnProperty` | Enables/disables a bean based on a property value (Strategy Pattern). | `@ConditionalOnProperty(name = "app.jobapi.enabled", havingValue = "true")` |
| `@Async` | Executes method asynchronously in a worker thread pool. | `processScanAsync()` |
| `@Transactional` | Wraps database queries in a transaction (auto-rollbacks on exceptions). | `processScanAsync()` |
| `@CrossOrigin` | Allows requests from React (`localhost:5173`) to Spring (`localhost:8080`). | `@CrossOrigin(origins = "*")` |

---

## 4. 🌐 HTTP Protocols, REST APIs & Web Basics

### 4.1 Client-Server Request Flow
1. **Client (Browser / React):** Issues an HTTP request to `http://localhost:8080/api/resumes`.
2. **Tomcat Server:** Receives TCP request on port 8080 and passes it to `DispatcherServlet`.
3. **DispatcherServlet:** Maps URL to `ResumeController`.
4. **RestController:** Processes input via Services and Repositories.
5. **Response:** Serializes Java DTO into JSON and returns HTTP status code.

### 4.2 HTTP Verbs & Status Codes
- **`POST` (`@PostMapping`):** Submits new data (e.g. upload resume).
- **`GET` (`@GetMapping`):** Fetches data (e.g. poll scan status).
- **`DELETE` (`@DeleteMapping`):** Deletes data (GDPR right to erasure).

#### Status Codes Used:
- `200 OK`: Successful fetch or instant duplicate match.
- `202 Accepted`: Accepted for background async processing.
- `204 No Content`: Successful deletion with no body returned.
- `400 Bad Request`: Client validation error (empty file).
- `404 Not Found`: Requested UUID resource does not exist.
- `500 Internal Error`: Server execution failure.

### 4.3 `multipart/form-data` & CORS
- **Multipart Upload:** Encodes binary file streams (PDFs) alongside text fields (`userId`) in HTTP POST requests.
- **CORS (Cross-Origin Resource Sharing):** Security mechanism enforced by browsers. `@CrossOrigin` permits requests between different ports (`localhost:5173` ➔ `localhost:8080`).

---

## 5. 🔒 Environment Variables & Secrets Management (.env)

### 5.1 Why Never Commit Passwords to Git?
Hardcoding API keys or database passwords in code checked into GitHub exposes credentials to hackers and automated scanners.

### 5.2 How `.env` Works in Our Project
- **`.env` File:** Stores local secret key-value pairs (`DB_PASSWORD=...`, `ADZUNA_APP_ID=...`).
- **`spring-dotenv` Library:** `me.paulschwarz:spring-dotenv` automatically reads `.env` on application startup and injects values into Spring `@Value` properties.
- **`.env.example` File:** Safe configuration template committed to Git that shows required keys without real passwords.

---

## 6. 🗄️ Database, SQL Indexes & Spring Data JPA Basics

### 6.1 Relational Database Fundamentals (RDBMS)
Data is organized into tables with rows and columns.
- **Primary Key (`@Id`):** Unique identifier for every row (UUID).
- **Foreign Key:** References primary key of another table (e.g., `scan_id` in `suggested_roles` references `scans.id`).
- **Cascade Delete (`ON DELETE CASCADE`):** Automatically deletes child rows when parent is deleted.

### 6.2 SQL B-Tree Indexes
Without an index, querying `SELECT * FROM resumes WHERE file_hash = 'abc'` scans every row in the table (O(N) full table scan).
- Adding `@Index(columnList = "file_hash")` creates a B-Tree index structure, speeding lookups to O(log N).

### 6.3 H2 In-Memory DB vs Production PostgreSQL
- **H2 (`com.h2database:h2`):** Fast in-memory database used during development (`dev` profile) and automated testing without external DB setup.
- **PostgreSQL:** Production relational database managed via `HikariCP` connection pool.

---

## 7. 🧰 Essential Libraries Used (Lombok, PDFBox, POI, Tika, Jackson)

- **Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j`):** Injects getters, setters, constructors, builders, and logging instances automatically.
- **Apache Tika:** Sniffs file magic bytes to verify genuine PDF/DOCX signatures.
- **Apache PDFBox:** Extracts raw text from PDF documents (`PDFTextStripper`).
- **Apache POI:** Extracts raw text from Microsoft DOCX documents (`XWPFWordExtractor`).
- **Jackson ObjectMapper:** Converts Java objects ➔ JSON (Serialization) and JSON ➔ Java objects (Deserialization).

---

## 8. ⚛️ React 19, JavaScript ES6 & Frontend Basics

- **React Components:** Reusable UI building blocks returning JSX markup (`<UploadZone />`, `<JobListingsView />`).
- **`useState` Hook:** Manages component state (e.g. list of resumes, active scan status).
- **`useEffect` Hook:** Handles side effects (polling backend REST API every 1.5s).
- **Vite Development Server:** Lightning-fast frontend dev server on `http://localhost:5173`. Proxies `/api` requests to Spring Boot on `http://localhost:8080`.

---

## 9. 🌿 Git Version Control & .gitignore Rules

### 9.1 Fundamental Git Workflow
- `git status`: Checks modified and untracked files.
- `git add .`: Stages modified files for commit.
- `git commit -m "msg"`: Creates a version snapshot in local history.
- `git push`: Pushes local commits to GitHub remote repository (`main` branch).

### 9.2 `.gitignore` File Protection
Specifies patterns ignored by Git to prevent accidental commits of sensitive or temporary files:
- `.env` & `.env*`: Prevents committing secrets.
- `target/` & `node_modules/`: Ignores compiled binaries and dependencies.
- `uploads/`: Ignores user resume files (GDPR PII compliance).
- `*.log`: Ignores diagnostic log files.
- `*STUDY_GUIDE*.md`: Keeps local study guides out of production repository commits.

---

## 10. ❓ Beginner Q&A for Technical Interviews

### Q1: What is Apache Maven and what is `pom.xml`?
> **Answer:** "Maven is a build automation and dependency management tool for Java applications. `pom.xml` (Project Object Model) is the configuration file where we declare dependencies, plugins, and build rules."

### Q2: What is the difference between `@RestController` and `@Service`?
> **Answer:** "`@RestController` handles HTTP requests, maps URL endpoints, and serializes response objects into JSON. `@Service` holds core business logic, validation, and orchestrates calls to repositories."

### Q3: What is CORS and how do you handle it in Spring Boot?
> **Answer:** "CORS (Cross-Origin Resource Sharing) is a browser security rule blocking requests between different origins (e.g., React on port 5173 requesting Spring on port 8080). We handle it in Spring Boot using `@CrossOrigin` annotations on REST controllers."

---

*This guide provides all fundamental prerequisites for the Nous AI Resume Engine project.*
