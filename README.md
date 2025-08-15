# ArtNote

ArtNote is a Next.js application for exploring artworks through detailed notes. It uses Prisma with a PostgreSQL database and Better Auth for authentication.

## Setup

1. Use the correct Node.js version:

   ```bash
   # If you have nvm installed
   nvm use

   # Or install Node.js 22 manually
   # The project requires Node.js 22 (see .nvmrc)
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Copy .env.example to .env and update the values for your environment
   cp .env.example .env
   # Edit .env with your local configuration

   # Pull development environment variables from Vercel
   vercel env pull .env.local
   ```

4. Apply database migrations (this also generates the Prisma client):

   ```bash
   pnpm prisma:migrate
   ```

5. Run the development server:
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
