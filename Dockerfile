# syntax=docker/dockerfile:1
# Production image, built by Dokploy for staging, previews and production (README, Deployments).
# Vite+ installs and builds; Node's own image runs. Keep its tag at package.json's devEngines.runtime.

# Vite+ resolves Node from devEngines.runtime and Bun from packageManager (package.json)
FROM ghcr.io/voidzero-dev/vite-plus:1.7.0 AS vp

FROM vp AS build
COPY --chown=vp:vp package.json bun.lock ./
# No lifecycle scripts: `prepare` installs git hooks, and the Prisma client is generated below
RUN vp install --frozen-lockfile --ignore-scripts
COPY --chown=vp:vp . .
# Prisma reads the datasource URL to generate the client; it never connects here
RUN PRISMA_DATABASE_URL=postgresql://build:build@localhost:5432/build vp exec prisma generate \
  && vp build

# Runtime dependencies only, for `prisma migrate deploy`; the server bundle in .output is
# self-contained. `prisma version` downloads the schema engine that the skipped postinstall would.
FROM vp AS deps
COPY --chown=vp:vp package.json bun.lock ./
RUN vp install --frozen-lockfile --ignore-scripts --prod \
  && PRISMA_DATABASE_URL=postgresql://build:build@localhost:5432/build vp exec prisma version

FROM node:26.13.1-slim
# Prisma's migration engine needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY package.json prisma.config.ts ./
# prisma.config.ts loads the env files through it
COPY scripts/env-files.ts ./scripts/
COPY prisma ./prisma
USER node
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node .output/server/index.mjs"]
