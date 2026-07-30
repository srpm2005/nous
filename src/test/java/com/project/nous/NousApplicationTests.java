package com.project.nous;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test: verifies the Spring ApplicationContext loads cleanly.
 *
 * Uses the "test" profile which wires an H2 in-memory database
 * (see src/test/resources/application-test.properties) so no
 * Neon connection is required during CI / local test runs.
 */
@SpringBootTest
@ActiveProfiles("test")
class NousApplicationTests {

	@Test
	void contextLoads() {
		// If the context fails to start, this test fails — that's the whole point.
	}

}
