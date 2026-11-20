# ArtNote: agent guide

ArtNote publishes scholarly notices about paintings for a French-speaking (Belgian) audience. Public visitors browse and read notices; admins write them in `/dashboard`. Domain terms (notice, writer, place…) are defined in `GLOSSARY.md`.

Stack: TanStack Start (React 19, Vite, Nitro), TanStack Router (file routes), Prisma 7 on PostgreSQL, Better Auth, Tailwind 4 + shadcn, Tiptap, Zod 4, Vitest. Hosted on Vercel. Single app, not a monorepo.

## Local setup

Needs Bun (package manager and script runner), Node 24 (runtime) and Docker.

```bash
bun install
bun run db:setup        # write .env, start Postgres, create this worktree's database, migrate, generate, seed
bun run dev             # the URL db:setup printed (BASE_URL in .env)
```

Each worktree gets its own database and dev port. On its first run, `db:setup` writes `.env` with a database named after the worktree folder (`artnote_<folder>`) in the shared Docker Postgres, and a free port in 3100–3999 as `BASE_URL`. An existing `.env` is never overwritten. The dev server listens on `BASE_URL`'s port and fails rather than move to another one, because Better Auth rejects sign-ins from any other origin.

Seeded accounts (password `artnote-dev-password`):

| Email               | Role                     |
| ------------------- | ------------------------ |
| `admin@example.com` | admin, sees `/dashboard` |
| `user@example.com`  | user                     |

The seed also creates 2 places, 3 artists and 3 notices (2 published, 1 draft).

Image and avatar uploads go to Vercel Blob and fail without a real `BLOB_READ_WRITE_TOKEN`. Put only that variable in `.env.local`, never a `vercel env pull`: `.env.local` wins over `.env`, and its `PRISMA_DATABASE_URL` would point everything at the shared database.

## Commands

| Command                                | Use                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `bun run check`                        | Everything CI runs: lint, Prisma generate and validate, knip, build (regenerates the route tree), type-check, tests |
| `bun run test`                         | Vitest unit tests (`src/**/*.test.ts`); `bun run test:watch` while working                                          |
| `bun run lint`                         | ESLint (zero warnings) and Prettier check                                                                           |
| `bun run lint:fix`                     | Fix lint and formatting                                                                                             |
| `bun run knip`                         | Unused files, exports and dependencies. Delete what it reports rather than ignoring it                              |
| `bun run type-check`                   | TypeScript 7 only; needs a generated Prisma client and a fresh route tree, which `check` provides                   |
| `bun run db:setup`                     | Write `.env` if missing, start Postgres, create this worktree's database, migrate, generate, seed. Safe to re-run.  |
| `bun run db:seed`                      | Re-run the seed (idempotent)                                                                                        |
| `bun run db:reset`                     | Drop this worktree's database and set it up from scratch; other worktrees keep theirs                               |
| `bun run db:down`                      | Stop the Postgres container, for every worktree                                                                     |
| `bun run prisma:migrate --name <name>` | Create a migration after editing `prisma/schema.prisma`                                                             |

To verify a change: run `bun run check` and commit any `src/routeTree.gen.ts` change it makes (CI fails on an uncommitted one), then run the app and check the change in a browser, signed in with a seeded account when needed.

## Code layout

```
src/
  routes/              Pages and layouts (file routes). routes/api/** holds only the Better Auth
                       handler, the Vercel crons and the analytics beacon.
  features/<feature>/
    actions/           Server code: <entity>-queries.ts (reads), <entity>-mutations.ts (writes),
                       server-only helpers (they import '@tanstack/react-start/server-only').
    components/        React components of the feature.
    hooks/             React hooks, including React Query hooks and their query-key factories.
    lib/               Pure logic (no React, no Prisma client, no request): filters, policies,
                       aggregation. Unit-tested next to the code as <name>.test.ts.
  schemas/             Zod schemas per entity: row schemas, form schemas, input schemas.
  lib/                 Cross-feature infrastructure: env, Prisma, Better Auth, permissions,
                       guard middleware, uploads, SEO.
  components/ui/       shadcn components and the rich text editor. components/layout/: app shell.
```

Features: `artworks` (notices, public and dashboard), `artists`, `places`, `analytics` (tracking, beacon ingestion, nightly and weekly aggregation, dashboard reports), `admin-dashboard`, `user-management`, `profile`, `auth`.

Import from the file that defines a symbol (`@/features/artworks/actions/artwork-queries`). There are no barrel `index.ts` files; do not add any.

## Writing a server function

All app data goes through `createServerFn` server functions. They are public HTTP endpoints, so each one has a guard (unless it serves public data) and a Zod validator:

```ts
export const updatePlace = createServerFn({ method: 'POST' })
  .middleware([requirePermission({ place: ['manage'] })]) // guard
  .validator(UpdatePlaceSchema) // Zod schema from src/schemas: parses the untrusted input
  .handler(async ({ data, context: { user } }) => {
    await prisma.place.update({ where: { id: data.id }, data: { /* … */ updatedById: user.id } });
  });
```

- **Guards** come from `src/lib/auth-functions.ts`: `dashboardAccessMiddleware` (admins: dashboard reads and notice writes), `requirePermission({ <resource>: [<action>] })` for a specific permission, `requireAuth` for a user's own data. Read the user from `context.user`, never from a second session lookup. Roles and permissions live in `src/lib/permissions.ts`; `hasRolePermission` is the one check, used by the guards and by `PermissionGate` in the UI.
- **Validation**: pass a Zod schema to `.validator()`; never a pass-through function like `(x: T) => x`. Bound every string and number that reaches a query (`IdSchema`, `SearchTextSchema`, `.max()`).
- **Output**: parse Prisma results through the schemas in `src/schemas/`. Public reads return public shapes only: a notice's writer is `AuthorSchema` (`id`, `name`, `image`), never the full `UserSchema`. Zod strips unknown keys, so parsing is what keeps private columns out of responses.
- **Errors**: server functions throw. A missing record is `throw notFound()`; a broken rule is `throw new Error('<message in French>')`. They never return `{ success, error }` objects and never swallow errors into `null` or `[]`.
- **Notice ownership**: a writer edits, publishes and deletes only their own notices (`writerId === user.id`); another writer's notice is reported as not found (`findOwnArtwork` in `artwork-mutations.ts`). Any admin can preview any notice.
- **User administration** calls Better Auth's server API (`auth.api.*` with `getRequestHeaders()`), never the browser `authClient`.

## Reading and mutating from the UI

- **Page data**: the route `loader` calls server functions. Return un-awaited promises for content that streams behind `<Suspense>` and `use()` (see `loadAdminDashboardData`).
- **Client-driven reads** (tables with filters, pickers): React Query hooks in `features/<feature>/hooks/`, keyed by the feature's key factory (`artistKeys`, `placeKeys`, `userKeys`).
- **Mutations**: call the server function in a `try`/`catch`, then refresh: `router.invalidate()` for loader data, `queryClient.invalidateQueries({ queryKey: <keys>.all })` for React Query data. On failure, `console.error` the error and `toast.error` a French message written in the component; do not show `error.message`, which can carry internals.
- **Forms**: validate with the same Zod schema the server function uses (`zodResolver(Schema)` or `Schema.safeParse(Object.fromEntries(formData))`).

## Analytics

The browser sends events to `/api/analytics` (`features/analytics/lib/tracking.ts`): `AnalyticsProvider` sends a timed page view for every route; notice pages also send a notice view (`useNoticeViewTracking`). The visitor-id cookie is set only after cookie consent; the session id lives in memory. Vercel Cron calls `/api/cron/aggregate-nightly` and `/api/cron/aggregate-weekly` with `CRON_SECRET`; they summarise events with the pure functions in `features/analytics/lib/aggregate.ts` and delete raw events after 90 days. The dashboard reads only the summaries. `Artwork.viewCount` is a separate server-side counter (`features/artworks/actions/artwork-views.ts`) that stores only salted IP hashes.

## Environment

Read configuration from `env` (`src/lib/env.ts`), never from `process.env` (lint enforces it). The schema is in `src/lib/env-schema.ts`. Outside development, a missing `BETTER_AUTH_SECRET` stops the server at startup, and the cron endpoints reject every request when `CRON_SECRET` is unset.

## Database

- `PRISMA_DATABASE_URL` selects the connection (`src/lib/prisma-client.ts`). A `postgresql://` URL connects directly through `@prisma/adapter-pg`; a `prisma+postgres://` URL goes through Prisma Accelerate (Vercel).
- Schema: `prisma/schema.prisma`. The client is generated into `src/generated/prisma` (gitignored) and imported from `@/generated/prisma/client`.
- `status`, `role` and place `type` are plain strings; the allowed values live in Zod enums in `src/schemas/common.ts`.
- The `Concept` and `Keyword` tables exist in the schema for a planned feature; no code reads or writes them yet.
- Vercel runs `prisma migrate deploy` on every build, previews included, so a migration reaches the shared database as soon as a branch deploys.
- Worktrees share one Postgres container (`compose.yaml`, port 5432) but each uses its own database, so seeding or resetting one never touches another.
- Only run migrations, resets and seeds against the local Docker database. `db:setup`, `db:reset` and the seed refuse a non-local host (`scripts/assert-local-db.ts`).

## Boundaries lint enforces

- Components, hooks and feature `lib/` code cannot import `@/lib/prisma`, `@/lib/auth`, `@/lib/auth-server` or `@/lib/env`; they reach the server through server functions.
- No `process.env` outside `src/lib/env.ts`, scripts and config.
- Type-only imports use `import type`; unused code fails lint, and unused files, exports and dependencies fail knip.

## Conventions

- User-facing text is French; code, identifiers and commits are English.
- Commits follow Conventional Commits (`feat:`, `fix(scope):`, `chore:`).
- New pure logic gets a unit test next to it. Tests do not need a database; keep Prisma calls in `actions/` and the logic they feed in `lib/`.

## Branches and releases

- Branch from `main` as `feat/*` or `fix/*` and open the PR against `main`. `main` deploys to staging.
- CI's required checks are the jobs named "Lint & Type Check" (runs `bun run check`) and "Validate Prisma Schema"; keep those names.
- Releases push a `vX.Y.Z` tag on a `main` commit; the Release workflow moves `production` to it. See the README's Deployments section.
