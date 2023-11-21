# Springboot Demo

This demo uses:

- Springboot with Kotlin and Gradle
- The standard `gradle build` with Java installed on the build agent
- Pack the final jar in a Docker image with `docker/metadata-action` and `docker/build-push-action`

More stuff that I will pack into this repository over time:

- CDK infrastructure
- Deployment workflow(s)
- Datadog service catalog update on deployment

## Why not Jib?

It's not easy to use the docker Github actions with the Jib build. I especially like the metadata action that does all the tagging for me.

## Why not Spring Boot Docker build?

Same reason as Jib basically, the Github actions are too nice to use.

## References

- https://gradlehero.com/jib-vs-spring-boot-for-building-docker-images/
