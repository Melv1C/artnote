# ArtNote: agent guide

ArtNote publishes scholarly notices about paintings for a French-speaking (Belgian) audience. Readers browse and read notices; admins write them in `/dashboard`. Use the domain terms of `GLOSSARY.md` (notice, writer, author, view count…), and read the decisions in `docs/adr/` before changing an area they cover.

Stack: TanStack Start (React 19, Vite, Nitro), TanStack Router (file routes), Prisma 7 on PostgreSQL, Better Auth, Tailwind 4 + shadcn, Tiptap, Zod 4. Toolchain: Vite+ (`vp`: Vite, Vitest, Oxlint, Oxfmt) plus knip, configured in `vite.config.ts` (ADR 0008). Self-hosted on Dokploy with MinIO for uploads (ADR 0011). Single app, not a monorepo.

## Local setup

Needs Bun (package manager and script runner), Node 24 (runtime) and Docker.

```bash
bun install
bun run db:setup        # write .env, start Postgres, create this worktree's database, migrate, generate, seed
bun run dev             # the URL db:setup printed (BASE_URL in .env)
```

In T3 Code, `t3.json` runs `bun install && bun run db:setup` when a worktree is created, and offers Dev and Check actions.

Each worktree gets its own database and dev port (ADR 0007). On its first run, `db:setup` writes `.env` with a database named after the worktree folder (`artnote_<folder>`) in the shared Docker Postgres, and a free port in 3100–3999 as `BASE_URL`. An existing `.env` is never overwritten. The dev server listens on `BASE_URL`'s port and fails rather than move to another one, because Better Auth rejects sign-ins from any other origin.

Seeded accounts (password `artnote-dev-password`):

| Email                | Role   | Use it to test                                                      |
| -------------------- | ------ | ------------------------------------------------------------------- |
| `admin@example.com`  | admin  | the dashboard, as writer of every seed notice                       |
| `writer@example.com` | admin  | notice ownership: another writer's notices are not found (ADR 0003) |
| `user@example.com`   | user   | a signed-in reader, refused from `/dashboard`                       |
| `banned@example.com` | banned | a refused sign-in                                                   |

The seed also creates 2 places, 3 artists and 3 notices (2 published, 1 draft), all by `admin@example.com`.

Image and avatar uploads go to the local MinIO that `db:setup` starts (`compose.yaml`, bucket `artnote` shared by every worktree). A `.env` written before MinIO was added lacks the `S3_*` variables: copy them from `.env.example`.

## Commands

| Command                                | Use                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `bun run check`                        | Everything CI runs: Prisma generate, validate and format check, `vp check` (format, lint, type check), `vp test`, knip, `vp build` |
| `bun run fix`                          | Format and apply lint fixes (`vp check --fix`)                                                                                     |
| `vp check`                             | Format check, type-aware lint and TypeScript type check in one pass; needs a generated Prisma client                               |
| `vp test` / `vp test watch`            | Vitest unit tests (`src/**/*.test.ts`); tests import from `vite-plus/test`                                                         |
| `bunx knip`                            | Unused files, exports and dependencies. Delete what it reports rather than ignoring it                                             |
| `bun run db:setup`                     | Write `.env` if missing, start Postgres and MinIO, create this worktree's database, migrate, generate, seed. Safe to re-run.       |
| `bun run db:seed`                      | Re-run the seed (idempotent)                                                                                                       |
| `bun run db:reset`                     | Drop this worktree's database and set it up from scratch; other worktrees keep theirs                                              |
| `bun run db:down`                      | Stop the Postgres and MinIO containers, for every worktree                                                                         |
| `bun run prisma:migrate --name <name>` | Create a migration after editing `prisma/schema.prisma`                                                                            |

`vp` comes with the dependencies (`node_modules/.bin/vp`); use `bunx vp` when it is not on your `PATH`. A pre-commit hook (`.vite-hooks/pre-commit`, installed by `bun install`) runs `vp check --fix` on staged files.

To verify a change: run `bun run check` and commit any `src/routeTree.gen.ts` change it makes (CI fails on an uncommitted one), then run the app and check the change in a browser, signed in with a seeded account when needed.

## Environments and QA

| Environment | URL                             | Deploys                                                      | Data                                  |
| ----------- | ------------------------------- | ------------------------------------------------------------ | ------------------------------------- |
| Local       | `BASE_URL` in `.env`            | `bun run dev`                                                | this worktree's database, local MinIO |
| Preview     | a `*.artnote.melvyn.be` address | each push to a PR labelled `preview`; removed when it closes | staging's database and MinIO          |
| Staging     | https://stg.artnote.melvyn.be   | each push to `main` (a merged PR), a few minutes later       | its own, seeded                       |
| Production  | https://artnote.melvyn.be       | a `vX.Y.Z` tag on `main` (Release workflow)                  | real notices and readers              |

Dokploy builds the `Dockerfile` for each one; the container migrates the database before it starts (ADR 0011). Deploys don't wait for CI. Dokploy posts a preview's address on its PR.

**QA a change on staging or its preview, never on production.** Staging has the same four accounts as the local seed, with their own passwords. They live in `.env.qa` at the root of the main checkout (the first path `git worktree list` prints), not in this repository:

```bash
set -a; source "$(git worktree list | head -1 | cut -d' ' -f1)/.env.qa"; set +a
# STAGING_URL, QA_ADMIN_EMAIL/PASSWORD, QA_WRITER_…, QA_USER_…, QA_BANNED_…
```

- Don't print the passwords, paste them into PRs or comments, or change them. If `.env.qa` or an account is missing, ask Melvyn instead of creating one.
- A preview shares staging's database: a migration on a labelled PR reaches staging at once, and what you create in a preview shows on staging. Start the titles of test notices, artists and places with `[QA]` and delete them afterwards. Leave the seed content as it is.
- Uploads on staging and previews are public files under `files.stg.artnote.melvyn.be`: upload only test images.
- Better Auth limits sign-ins per IP: space out sign-ins (about 10 seconds) when switching accounts.
- Umami does not measure staging or previews, so test page views and notice readings through the tests in `features/analytics`.

## Code layout

```
src/
  routes/              Pages and layouts (file routes). routes/api/** holds only the Better Auth
                       handler and the cron endpoint.
  features/<feature>/
    actions/           Server code: <entity>-queries.ts (reads), <entity>-mutations.ts (writes),
                       server-only helpers (they import '@tanstack/react-start/server-only').
    components/        React components of the feature.
    hooks/             React hooks, including React Query hooks and their query-key factories.
    lib/               Pure logic (no React, no Prisma client calls, no request; `import type`
                       of Prisma types is fine): filters, policies, aggregation.
                       Unit-tested next to the code as <name>.test.ts.
  schemas/             Zod schemas per entity: row schemas, form schemas, input schemas.
  lib/                 Cross-feature infrastructure: env, Prisma, Better Auth, permissions,
                       guard middleware, uploads, SEO.
  hooks/               Cross-feature React hooks (useDebounce, useIsMobile).
  components/ui/       shadcn components and the rich text editor. components/layout/: app shell;
                       components/data-table/: PagedTable.
```

Features: `artworks` (notices, public and dashboard, and the view count), `artists`, `places`, `analytics` (the Umami tracker: which pages are measured, page views and notice readings), `admin-dashboard` (the dashboard home: content figures and the link to Umami), `user-management`, `profile`, `auth`.

Dashboard lists come in two kinds. Artists and places are server-paginated: `PagedTable` (`src/components/data-table/paged-table.tsx`) renders one page, the server filters, orders and pages (`paginate`, `pageWindow` in `src/lib/pagination.ts`), and each feature keeps its filter-to-`where` mapping as a tested pure builder in `lib/` (`buildArtistWhere`, `buildPlaceWhere`). The writer's notices and the users are small lists loaded whole and filtered in the browser (`filterAdminArtworks`; users are capped at 100 by `fetchUsers`). `buildArtworkWhere` belongs to the public notices list, not the dashboard.

Import from the file that defines a symbol (`@/features/artworks/actions/artwork-queries`). There are no barrel `index.ts` files; do not add any. A feature may import another feature's `actions/`, `hooks/` and `lib/` (the dashboard composes `artworks` and `user-management` queries); UI shared by several features lives in `src/components/`.

## Domain terms in code

`GLOSSARY.md` names the concepts; some carry other names in the schema and code:

| Term                      | In code                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Notice                    | `Artwork` model, `artwork*` in code; `noticeId` in the Umami notice reading (ADR 0001)  |
| Image attachment          | `ArtworkImage` model                                                                    |
| Artist credit             | `ArtworkArtist` model (an artist and their role on one notice)                          |
| Writer / Author           | `Artwork.writer` (a `User`) / `AuthorSchema`                                            |
| Page view, notice reading | Umami page views and `notice_read` events, sent from `features/analytics` (no table)    |
| View count                | `Artwork.viewCount`; its deduplication records are the `PageView` model, not page views |

## Writing a server function

All app data goes through `createServerFn` server functions (ADR 0002). They are public HTTP endpoints, so each one has a guard (unless it serves public data) and a Zod validator:

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
- **Enforced by a test**: `src/lib/server-functions.test.ts` reads every `createServerFn` and fails when one has no guard (unless listed in its `PUBLIC_SERVER_FUNCTIONS`) or reads input without a schema. Adding a public server function means adding it to that list, on purpose.
- **Output**: parse Prisma results through the schemas in `src/schemas/`. Zod drops every key a schema does not declare, so the schema decides what leaves the server. Public reads use the public schemas: `PublicArtworkSchema` (no `writerId` or view counters), `PublicPlaceSchema` and `PublicArtistSchema` (no audit ids), and `AuthorSchema` for a writer (`id`, `name`, `image`), never `UserSchema`.
- **Errors**: server functions throw. A missing record is `throw notFound()`; a broken rule is `throw new Error('<message in French>')`. They never return `{ success, error }` objects and never swallow errors into `null` or `[]`. Guards are the one exception: they throw `UNAUTHORIZED_ERROR`, a marker that `UnauthorizedOrError` (`components/layout/unauthorized.tsx`) renders as a French page.
- **Notice ownership**: a writer reads, edits, publishes and deletes only their own notices in the dashboard: every such query filters with `ownedBy(user.id, …)` (`features/artworks/lib/artwork-status.ts`), and another writer's notice is reported as not found (ADR 0003). Any admin can preview any notice. Public reads filter with `publishedWhere`.
- **Loaders have no side effects**: the router preloads a route's loader when a link is hovered (`defaultPreload: 'intent'`), so a loader's server function must only read. Writes triggered by visiting a page run from the page component (see `useRecordNoticeView`).
- **User administration** calls Better Auth's server API (`auth.api.*` with `getRequestHeaders()`), never the browser `authClient`.

## Reading and mutating from the UI

- **Page data**: the route `loader` calls server functions. Return un-awaited promises for content that streams behind `<Suspense>` and `use()` (see `loadAdminDashboardData`).
- **Client-driven reads** (tables with filters, pickers): React Query hooks in `features/<feature>/hooks/`, keyed by the feature's key factory (`artistKeys`, `placeKeys`, `userKeys`).
- **Mutations**: call the server function in a `try`/`catch`, then refresh: `router.invalidate()` for loader data, `queryClient.invalidateQueries({ queryKey: <keys>.all })` for React Query data. On failure, `console.error` the error and `toast.error` a French message written in the component; do not show `error.message`, which can carry internals.
- **Forms**: validate with the same Zod schema the server function uses (`zodResolver(Schema)` or `Schema.safeParse(Object.fromEntries(formData))`). The one extension is the notice editor: `ArtworkEditorSchema` adds each attached image's details for previews, and `ArtworkFormSchema` drops them on the server. Import `z` from `@/lib/zod` (lint forbids `'zod'`): it sets French default messages, so give a field a custom message only when the default is unclear.

## Analytics

Audience measurement uses Umami Cloud (ADR 0010, which supersedes ADR 0004). The root layout renders Umami's script only where `UMAMI_WEBSITE_ID` is set (production), served with its collect endpoint under `/stats/` on our own domain (Nitro route rules in `vite.config.ts`). Automatic page views are off: `useUmamiPageViews` sends one for each route that `isMeasuredPath` accepts (public pages, not the dashboard or previews), and notice pages send a `notice_read` with its reading-time bracket when the reader leaves (`useNoticeReading`). The rules live in the pure, tested `features/analytics/lib/umami.ts`. Umami is cookieless, and missing or blocked it does nothing. Admins read the figures in Umami, from the "Voir les statistiques" link on the dashboard home; the app has no analytics charts or queries. The first-party analytics tables were dropped; their earlier daily summaries survive only in a CSV archive outside the repo.

`Artwork.viewCount` is a separate server-side counter: the notice page calls `recordNoticeView` on mount (`useRecordNoticeView`), which counts published notices only, once per client IP per 30 minutes, and stores only salted IP hashes (`features/artworks/actions/view-count.ts`). A Dokploy schedule calls `/api/cron/prune-view-records` nightly with `CRON_SECRET` to delete the deduplication records that can no longer affect a count; it is the only cron (README, Deployments). The IP comes from the header named by `CLIENT_IP_HEADER` (`x-real-ip`, set by Traefik); where it is unset, such as on the local dev server, views are not counted.

## Environment

Read configuration from `env` (`src/lib/env.ts`), never from `process.env` (lint enforces it). The schema is in `src/lib/env-schema.ts`. With `NODE_ENV=production` (the Docker image) the server refuses to start without `BETTER_AUTH_SECRET`. On a Dokploy preview, `DOKPLOY_DEPLOY_URL` replaces `BASE_URL`. The `S3_*` variables are all set or all unset; without them uploads fail. The cron endpoint rejects every request when `CRON_SECRET` is unset. `UMAMI_WEBSITE_ID` is optional and set in production only; without it no Umami script is rendered.

## Database

- `PRISMA_DATABASE_URL` selects the connection (`src/lib/prisma-client.ts`), a `postgresql://` URL through `@prisma/adapter-pg`.
- Schema: `prisma/schema.prisma`. The client is generated into `src/generated/prisma` (gitignored) and imported from `@/generated/prisma/client`.
- `status`, `role` and place `type` are plain strings; the allowed values live in Zod enums in `src/schemas/common.ts` (ADR 0005).
- The `Concept` and `Keyword` tables exist in the schema for a planned feature; no code reads or writes them yet.
- Every container runs `prisma migrate deploy` when it starts, previews included, and previews share staging's database, so a migration reaches it as soon as a branch deploys: keep migrations backward compatible (ADR 0006).
- Worktrees share one Postgres container (`compose.yaml`, port 5432) but each uses its own database, so seeding or resetting one never touches another.
- Only run migrations, resets and seeds against the local Docker database. `db:setup`, `db:reset` and the seed refuse a non-local host (`scripts/assert-local-db.ts`).

## Boundaries lint enforces

- Pages (`src/routes/**/*.tsx`), components, hooks and feature `lib/` code cannot import `@/lib/prisma`, `@/lib/auth`, `@/lib/auth-server` or `@/lib/env`; they reach the server through server functions. Modules that must stay on the server also import `@tanstack/react-start/server-only`, so the build fails if one reaches the browser bundle.
- No `process.env` outside `src/lib/env.ts`, scripts and config.
- Type-only imports use `import type`; unused code fails lint, and unused files, exports and dependencies fail knip. knip skips `src/components/ui/` because shadcn components export variants the app may not use yet.
- Four React Compiler rules (`react/purity`, `react/set-state-in-effect`, …) are off in `vite.config.ts` because existing components break them; new code should still follow them. A few type-aware rules are off for `src/components/ui/` (shadcn code kept close to upstream).
- Oxlint has no `no-restricted-syntax`: restrictions use `no-restricted-imports` and `no-restricted-properties` (`process.env`).

## Conventions

- User-facing text is French; code, identifiers and commits are English.
- Commits follow Conventional Commits (`feat:`, `fix(scope):`, `chore:`).
- New pure logic gets a unit test next to it. Tests do not need a database; keep Prisma calls in `actions/` and the logic they feed in `lib/`.

## Branches and releases

- Branch from `main` as `feat/*` or `fix/*` and open the PR against `main`. `main` deploys to staging; the `preview` label on a PR gives it a Dokploy preview.
- CI (`.github/workflows/ci.yml`) is one job, "Check", the required check on `main`: it runs `bun run check`, fails if the build changed committed files, and runs `bun audit --audit-level=critical`.
- Releases push a `vX.Y.Z` tag on a `main` commit; the Release workflow moves `production` to it (ADR 0009). See the README's Deployments section.
