# ==========================================
# Stage 1: Build the Maven application
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cache layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build package
COPY src ./src
RUN mvn package -DskipTests

# ==========================================
# Stage 2: Run the application jar
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from Stage 1
COPY --from=build /app/target/tracker-0.0.1-SNAPSHOT.jar app.jar

# Expose backend port
EXPOSE 8080

# Run with production profile active and optimized memory settings for 512MB RAM containers
ENTRYPOINT ["java", "-XX:+UseSerialGC", "-Xss256k", "-XX:MaxRAMPercentage=75.0", "-Dspring.profiles.active=prod", "-jar", "app.jar"]
