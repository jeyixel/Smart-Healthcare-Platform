# ──────────────────────────────────────────────────────────────
# Stage 1 (Builder): Compile from source using the Maven Wrapper
# ──────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy POM first → cache dependency downloads across rebuilds
COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./
RUN chmod +x ./mvnw
RUN ./mvnw -B dependency:go-offline

# Copy source code and build the JAR
COPY src ./src
RUN ./mvnw -B -DskipTests clean package

# ──────────────────────────────────────────────────────────────
# Stage 2 (Runner): Slim JRE image for production
# ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Non-root user for security
RUN groupadd -g 1001 appgroup && useradd -u 1001 -g appgroup -ms /bin/bash appuser

COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8080

# Memory-limited entrypoint to prevent host RAM exhaustion
ENTRYPOINT ["sh", "-c", "java -Xmx256m -Xms256m -jar app.jar"]
