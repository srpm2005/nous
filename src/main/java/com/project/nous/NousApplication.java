package com.project.nous;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Entry point for the Nous AI Resume Scanner.
 * Enables automated daily screening at 12:00 PM for Enterprise Hiring Portals.
 */
@SpringBootApplication
@EnableScheduling
public class NousApplication {


	public static void main(String[] args) {
		SpringApplication.run(NousApplication.class, args);
	}

}
