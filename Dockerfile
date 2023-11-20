# syntax=docker/dockerfile:1
ARG JAVA_VERSION=17
FROM eclipse-temurin:${JAVA_VERSION}-jre-alpine

VOLUME /tmp
ARG EXTRACTED=target/extracted
COPY ${EXTRACTED}/application/ ./
COPY ${EXTRACTED}/dependencies/ ./
COPY ${EXTRACTED}/snapshot-dependencies/ ./
COPY ${EXTRACTED}/spring-boot-loader/ ./

RUN addgroup -S demo && adduser -S demo -G demo
USER demo

ENTRYPOINT ["java","org.springframework.boot.loader.JarLauncher"]
