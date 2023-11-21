ARG JAVA_VERSION=17
FROM eclipse-temurin:${JAVA_VERSION}-jre-alpine

ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

RUN addgroup -S spring && adduser -S spring -G spring
USER spring

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app.jar"]
