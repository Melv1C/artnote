# ArtNote

ArtNote is a Next.js application for exploring artworks through detailed notes. It uses Prisma with a PostgreSQL database and Better Auth for authentication.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and update the values for your environment:
   ```bash
   cp .env.example .env
   # edit .env
   ```
3. Apply database migrations (this also generates the Prisma client):
   ```bash
   pnpm prisma:migrate
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```
   The app will be available at http://localhost:3000.

## Folder overview

- `app/` – Next.js routes and layout files.
- `src/` – Components, features, libraries and schemas.
- `prisma/` – Prisma schema and database migrations.
- `docker-compose.yml` – Local PostgreSQL setup for development.
- `package.json` – Project scripts and dependencies.

