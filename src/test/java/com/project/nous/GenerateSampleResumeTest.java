package com.project.nous;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;

public class GenerateSampleResumeTest {

    @Test
    void createRichSampleResumePdf() throws IOException {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                cs.setLeading(20f);
                cs.newLineAtOffset(50, 750);
                cs.showText("Alex Rivera - Senior Software Engineer & Backend Architect");
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
                cs.showText("San Francisco, CA | alex.rivera@example.com | github.com/alexrivera");
                cs.newLine();
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                cs.showText("Key Technical Projects & Architectures Built");
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.showText("- Cloud Distributed Microservices: Designed Spring Boot microservices with Java 17, Redis caching, and PostgreSQL.");
                cs.newLine();
                cs.showText("- Event-Driven Kafka Data Pipeline: Processed 100M daily events with Apache Kafka, Docker, and AWS Kubernetes.");
                cs.newLine();
                cs.showText("- Full Stack Platform: Developed dynamic responsive web apps with React, TypeScript, Vite, and REST APIs.");
                cs.newLine();
                cs.showText("- AI & Data Integration: Built Python data ingestion pipelines and integrated machine learning scoring services.");
                cs.newLine();
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                cs.showText("Professional Work Experience");
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.showText("Senior Backend Software Engineer | Apex Cloud Systems (2022 - Present)");
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.showText("Lead architect for distributed backend services, high-throughput REST APIs, SQL database optimization, CI/CD pipelines.");
                cs.newLine();
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
                cs.showText("Technical Stack & Skills");
                cs.newLine();

                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                cs.showText("Languages & Frameworks: Java, Spring Boot, Python, TypeScript, React, SQL, PostgreSQL, Hibernate, JPA.");
                cs.newLine();
                cs.showText("Cloud & Tooling: Docker, Kubernetes, AWS, Kafka, Redis, Git, Linux, Microservices, REST APIs, CI/CD.");
                cs.endText();
            }

            File dest = new File("src/test/resources/fixtures/sample_alex_rivera_resume.pdf");
            doc.save(dest);
            System.out.println("✅ Saved sample resume PDF to: " + dest.getAbsolutePath());
        }
    }
}
