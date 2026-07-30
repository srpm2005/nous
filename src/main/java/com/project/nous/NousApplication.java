package com.project.nous;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Nous AI Resume Scanner.
 *
 * Phase 1: File upload, MIME validation, text extraction, persistence.
 */
@SpringBootApplication
public class NousApplication {

	public static void main(String[] args) {
		SpringApplication.run(NousApplication.class, args);
	}

}
