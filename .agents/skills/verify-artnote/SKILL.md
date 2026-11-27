---
name: verify-artnote
description: Launch this worktree's ArtNote web app (TanStack Start dev server, local Postgres and MinIO) and drive it in a real browser with playwright-cli to prove a change works: sign in with a seeded account, use the public notice pages or the /dashboard, and capture snapshots, screenshots and database state as evidence. Use when asked to verify, QA, demo or screenshot ArtNote behavior locally, or before claiming a UI or server-function change works.
---

# Verify ArtNote

ArtNote is one web app: public pages (`/`, `/artworks`, `/artworks/<id>`, `/carte`, `/about`, `/confidentialite`) for readers, and `/dashboard` for admins who write notices. There is no CLI or public API to drive; every server call is a TanStack `createServerFn` behind the UI, so verification goes through the browser. The UI is French: every handle below is a French accessible name, copy it exactly (typographic apostrophes `’` included).

Everything here is per worktree: its own database (`artnote_<folder>`), its own port (`BASE_URL` in `.env`, 3100–3999), shared Postgres and MinIO containers. Two worktrees can be verified side by side. Inside one worktree there is one instance; never start a second.

The helper is `.agents/skills/verify-artnote/control.sh` (below: `$C`). Run every command from the worktree root, including `playwright-cli` (its sessions and `.playwright-cli/` files are scoped to the current directory).

```bash
C=.agents/skills/verify-artnote/control.sh
```

## Launch

```bash
$C launch     # ends with: READY http://localhost:<port>
```

It runs `vp install` if `node_modules` is missing, then `vp run worktree:setup` (writes `.env` if missing, starts the `db` and `storage` containers, creates this worktree's database, migrates, generates the Prisma client, re-seeds), then starts `vp run dev` in its own process group and waits until the home page renders **and** Better Auth answers `/api/auth/ok`. It then warms `/artworks` so Vite's first dependency optimization does not reload the page mid-drive. From an empty database this reaches a usable, seeded app in about a minute.

If this worktree's dev server is already running (Melvyn's T3 "Dev" action, say), `launch` reuses it and records that it did not start it, so cleanup will leave it alone. If the port is held by anything else, it refuses.

Seeded data (re-seeded by every `launch`; extra rows are not removed by seeding):

| Account (password `artnote-dev-password`) | Role          | What it shows                                                                  |
| ----------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| `admin@example.com` ("Admin ArtNote")     | admin         | the dashboard; writer of all 4 seed notices                                    |
| `writer@example.com`                      | admin         | ownership: sees no seed notice in "Mes notices"; their edit URLs are not found |
| `user@example.com`                        | user (reader) | signed-in reader; `/dashboard` shows "Accès non autorisé"                      |
| `banned@example.com`                      | user, banned  | sign-in refused                                                                |

Notices: `seed-artwork-icarus` "Paysage avec la chute d’Icare", `seed-artwork-census` "Le Dénombrement de Bethléem" and `seed-artwork-lamb` "L’Adoration de l’Agneau mystique" (published), `seed-artwork-empire` "L’Empire des lumières" (draft). Places: "Musées royaux des Beaux-Arts de Belgique" (Icare and the Dénombrement), "Cathédrale Saint-Bavon" (the Agneau), "Musée Magritte Museum" (only the draft, so `/carte` leaves it out) and "Musée Groeninge" (no notice and no position: "Sans position" in `/dashboard/places`). Artists: Pieter Bruegel l’Ancien, Jan van Eyck, René Magritte. The seed's values live in `prisma/seed-data.ts`.

## Doctor

```bash
$C doctor
```

Read-only. Prints the worktree, commit and branch, URL and database, who owns the listening process, and `ok`/`FAIL` for: listener's cwd is this worktree, home page renders, `/api/auth/ok`, Postgres and MinIO healthy, the 4 seed accounts exist. Also lists this worktree's open browser sessions. Run it first whenever anything looks off; exit code 1 means do not drive.

## Drive

Harness: `playwright-cli` (headless Chrome, in-memory profile). Session names are prefixed per worktree: `$C session admin` prints `artnote-<port>-admin`.

```bash
$C signin admin                 # opens session artnote-<port>-admin, signs in through the header dialog,
                                # then checks /api/auth/get-session returns admin@example.com
S=$($C session admin)
P="timeout 30 playwright-cli -s=$S"   # see the first rule below
U=$(sed -nE 's/^BASE_URL="?([^"]*)"?$/\1/p' .env)
$P goto "$U/dashboard/artworks"
$P --raw snapshot "getByRole('main').last()"
```

`$C signin <admin|writer|user|banned> [name]` takes an optional second argument to open several sessions for the same account. Each session is an isolated browser context, so admin and writer can be open at once.

Rules that keep drives stable:

- Prefix every `playwright-cli` call with `timeout 30` (`P="timeout 30 playwright-cli -s=$S"`). It has no action timeout of its own: an action on a locator that matches nothing waits forever and blocks the whole shell. Exit code 124 means it timed out; the browser session stays busy with the stuck action for a while, so the next command may time out too. Run `$C doctor`, wait until `$P --raw eval "location.pathname"` answers again, snapshot, and only then retry (or `close` the session and sign in again).
- Target by role and accessible name, as Playwright locators: `"getByRole('button', { name: 'Créer la notice' })"`. Refs like `e42` change after every navigation; use them only inside one snapshot-act step.
- Names match as case-insensitive substrings unless you pass `exact: true`, and a locator that matches two elements fails in strict mode: on `/dashboard`, `name: 'Mes notices'` also matches "Toutes mes notices".
- Scope by container when a name repeats: the sign-in dialog has its own "Se connecter" button (`getByRole('dialog', { name: 'Se connecter' }).getByRole('button', { name: 'Se connecter' })`); the editors' undo buttons are also called "Annuler" (the form's cancel is `getByRole('button', { name: 'Annuler' }).last()`).
- The dashboard has one `main` landmark (the inset beside the sidebar); `"getByRole('main').last()"` works on every page.
- Rich text fields are Tiptap editors exposed as textboxes "Notice" and "Bibliographie": `click "getByRole('textbox', { name: 'Notice', exact: true })"`, then `type "…"`.
- Deletes ask in an in-page `alertdialog` ("Supprimer « … » ?"), not the browser's `confirm()`: click its destructive button ("Supprimer la notice", "Supprimer", "Supprimer le compte") or "Annuler". Focus starts on "Annuler".
- After an action, wait for its result, not a fixed time: poll `$P --raw eval "location.pathname"` or `find "<text>"`. Toasts live in `region "Notifications alt+T"` and vanish after a few seconds.
- Read state back from the database (each query runs in a read-only transaction, a guard against mistakes, not a sandbox): `$C sql "select id, title, status from artwork where title like '[QA]%'"`. Tables use `@@map` names (`artwork`, `artist`, `place`, `artwork_artist`, `"user"`) with camelCase quoted columns (`"writerId"`, `"placeId"`, `"publishedAt"`, `"viewCount"`).

Recipes per feature are in [`features/README.md`](features/README.md). A proof that covers one entry point of a feature does not cover the others listed there.

## Evidence

```bash
E=$($C evidence dashboard-notices)   # .verify/evidence/<timestamp>-dashboard-notices/, with run.txt (commit, branch, URL)
$P --raw snapshot "getByRole('main').last()" > "$E/01-form.aria.yml"
$P screenshot --filename="$E/01-form.png"
$C sql "select …" > "$E/02-db.txt"
```

Evidence lives in `.verify/evidence/` at the worktree root (gitignored) and survives cleanup. Proof standards:

- Drive the real user path: header button, sidebar link, form submit. No calling server functions from `eval`, no writing rows with SQL to set up what the journey is meant to create.
- Capture the action and the result: an ARIA snapshot before (the filled form) and after (the list or page that shows the change), plus a screenshot of each.
- Verify side effects alongside the screen: the row in the database (`$C sql`), the owner (`"writerId"`), the public page for a published notice, the 404 for a draft.
- Access rules need a second account: prove a denial by signing in as `writer` or `user` in their own session, not by reasoning about the code.
- Not verifiable locally, say so instead of claiming it: Umami page views and `notice_read` (no `UMAMI_WEBSITE_ID` locally; covered by the tests in `features/analytics`), and the view count (no `CLIENT_IP_HEADER` locally, so views are not counted). Staging QA is a separate process: see AGENTS.md, "Environments and QA".

## Cleanup

```bash
$C cleanup
```

Closes this worktree's `artnote-<port>-*` browser sessions, stops the dev server only if `launch` started it (by its process group id, never by name), copies its log to `.verify/evidence/last-dev.log`, and deletes local rows titled `[QA]…` (notices, artists, and places no notice still uses). It never touches `.verify/evidence/`. Name every record you create `[QA] …` so cleanup can find it, and do not credit a `[QA]` artist on a seed notice (deleting the artist removes that credit); uploaded test images stay in the shared local MinIO bucket (harmless, local only).

Run cleanup after every attempt, failed ones included. To leave the database exactly as seeded instead, `vp run db:reset` (this worktree's database only).
