# Multi-stage Dockerfile for Spring Boot Application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy POM and download dependencies for layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root user and uploads directory
RUN addgroup --system spring && adduser --system --ingroup spring spring
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring:spring

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
