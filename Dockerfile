# syntax=docker/dockerfile:1
# Production image, built by Dokploy for staging, previews and production (README, Deployments).
# The container applies pending migrations, then starts the Nitro server on port 3000.

FROM oven/bun:1.4.4 AS bun

FROM node:24-slim AS base
# Prisma's migration engine needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

FROM base AS build
COPY package.json bun.lock ./
# No lifecycle scripts: `prepare` installs git hooks, and the Prisma client is generated below
RUN bun install --frozen-lockfile --ignore-scripts
COPY . .
# Prisma reads the datasource URL to generate the client; it never connects here
RUN PRISMA_DATABASE_URL=postgresql://build:build@localhost:5432/build node_modules/.bin/prisma generate \
  && node_modules/.bin/vp build

# Runtime dependencies only, for `prisma migrate deploy`; the server bundle in .output is
# self-contained. `prisma version` downloads the schema engine that the skipped postinstall would.
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --ignore-scripts --production \
  && PRISMA_DATABASE_URL=postgresql://build:build@localhost:5432/build node_modules/.bin/prisma version

FROM base
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
USER node
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && exec node .output/server/index.mjs"]
