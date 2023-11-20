ARG JAVA_VERSION=17
FROM eclipse-temurin:${JAVA_VERSION}-jre-alpine

VOLUME /tmp
ARG EXTRACTED=target/extracted
COPY ${EXTRACTED}/dependencies/ ./
COPY ${EXTRACTED}/spring-boot-loader/ ./
COPY ${EXTRACTED}/snapshot-dependencies/ ./
COPY ${EXTRACTED}/application/ ./

RUN addgroup -S demo && adduser -S demo -G demo
USER demo

ENTRYPOINT ["java","org.springframework.boot.loader.JarLauncher"]
