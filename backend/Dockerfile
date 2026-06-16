# AEGIS Spring Boot API — pre-built JAR image
# JAR is built locally via: docker run --rm --dns 8.8.8.8 -v backend:/workspace maven:3.9-eclipse-temurin-21-alpine mvn -B -DskipTests clean package
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/aegis-api-1.0.0.jar app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC -XX:+UseStringDeduplication"
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/actuator/health || exit 1
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
