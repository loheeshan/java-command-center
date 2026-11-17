# One container: Next.js website + Java runner + JDK 25 + Maven.
# The runner listens on 127.0.0.1 inside the container only; just the website port is exposed.
FROM eclipse-temurin:25-jdk-noble

ARG NODE_VERSION=22.20.0
ARG MAVEN_VERSION=3.9.15

RUN apt-get update && apt-get install -y --no-install-recommends curl xz-utils ca-certificates \
 && curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1 \
 && curl -fsSL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz | tar -xz -C /opt \
 && ln -s /opt/apache-maven-${MAVEN_VERSION} /opt/maven \
 && apt-get purge -y xz-utils && rm -rf /var/lib/apt/lists/*

ENV MAVEN_HOME=/opt/maven \
    PATH=/opt/maven/bin:$PATH \
    MAVEN_REPO=/home/app/.m2/repository \
    NEXT_TELEMETRY_DISABLED=1

RUN useradd -m -u 1001 app
WORKDIR /app
RUN chown app:app /app
USER app

COPY --chown=app:app package.json package-lock.json ./
RUN npm ci

COPY --chown=app:app . .

# Download every Maven dependency and plugin now, so graded runs work offline (-o) and fast.
# Runs the real test phase once on each project's reference solution.
RUN for p in dispatch tickets; do \
      d=$(mktemp -d) && cp -r java-grader/$p/starter/. $d/ && cp -r java-grader/$p/reference/src/. $d/src/ \
      && mkdir -p $d/src/test/java && cp -r java-grader/$p/tests/. $d/src/test/java/ \
      && (cd $d && mvn -B -q test -Dmaven.repo.local=$MAVEN_REPO -Dmaven.test.failure.ignore=true) \
      && rm -rf $d; \
    done

RUN npm run build

ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "scripts/start-prod.mjs"]
