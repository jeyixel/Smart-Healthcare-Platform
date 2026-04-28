# ──────────────────────────────────────────────────────────────
# Stage 1 (Builder): Compile from source using the Maven Wrapper
# ──────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml ./
COPY .mvn/ .mvn/
COPY mvnw ./
RUN chmod +x ./mvnw
RUN ./mvnw -B dependency:go-offline

COPY src ./src
RUN ./mvnw -B -DskipTests clean package

# ──────────────────────────────────────────────────────────────
# Stage 2 (Runner): Slim JRE image for production
# ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

RUN groupadd -g 1001 appgroup && useradd -u 1001 -g appgroup -ms /bin/bash appuser

COPY --from=builder --chown=appuser:appgroup /app/target/*.jar app.jar

USER appuser

EXPOSE 8085

ENTRYPOINT ["sh", "-c", "java -Xmx256m -Xms256m -jar app.jar"]