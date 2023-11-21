# Springboot Demo

This demo uses:

- Springboot with Kotlin and Gradle
- Github actions to build a container using the normal `gradle build` method

## Why use gradle build and a manual Docker build?

- Jib does not work use the docker/metadata action, which I love.
- Same for Spring Boot Plugin building

## References

- https://gradlehero.com/jib-vs-spring-boot-for-building-docker-images/
