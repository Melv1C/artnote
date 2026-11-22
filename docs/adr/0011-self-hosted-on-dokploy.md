---
status: accepted
---

# Self-hosted on Dokploy, with MinIO for uploads

ArtNote ran on Vercel, with Prisma Postgres behind Prisma Accelerate and uploads in Vercel Blob. It now runs on our own Dokploy server: Dokploy builds the `Dockerfile` for each environment, Traefik serves it, and each environment has its own Postgres and its own MinIO. Previews share staging's database and MinIO, as they shared the preview database before (ADR 0006).

| Environment | Address                      | Deploys on                                            |
| ----------- | ---------------------------- | ----------------------------------------------------- |
| Production  | `artnote.melvyn.be`          | a push to `production`, moved by a release (ADR 0012) |
| Staging     | `stg.artnote.melvyn.be`      | a push to `main`                                      |
| Preview     | `*.artnote.melvyn.be` per PR | a PR from this repository with the `preview` label    |

## Considered options

- **Stay on Vercel**: no servers to run, but three paid-tier-bound services for a small site, and the data outside our hands.
- **Keep Vercel Blob from Dokploy**: works from anywhere with a token, but keeps a Vercel account just for 17 files.
- **Dokploy's tag trigger for production**: Dokploy can deploy on a tag, but it then builds the app's configured branch, not the tagged commit, and accepts any tag name. Moving a `production` branch (ADR 0009) deploys exactly the tagged commit.

## Consequences

- **Migrations run when the container starts** (`prisma migrate deploy` in the image's command), so a preview's migration still reaches staging's database as soon as it deploys: ADR 0006's backward-compatibility rule holds.
- **No managed backups.** The database and the uploads live on one server, and nothing copies them elsewhere. A lost disk loses the data; this was accepted.
- **MinIO's official images are gone**: we run the community-maintained `pgsty/minio` build, pinned by release tag. Buckets allow public reads of objects and no listing (`scripts/storage/init-bucket.sh`).
- **The visitor's IP comes from Traefik's `X-Real-Ip`**, named by `CLIENT_IP_HEADER`: Traefik overwrites it, so a client cannot fake it. It feeds the view count and Better Auth's rate limiting.
- **The nightly cron is a Dokploy schedule** that calls `/api/cron/prune-view-records` from inside the container.
- **A preview's base URL** comes from `DOKPLOY_DEPLOY_URL`, which Dokploy sets on previews, so Better Auth accepts sign-ins on the preview's host.
