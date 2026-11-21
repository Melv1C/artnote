# ArtNote verification map

The maintained source for verifying ArtNote's user-facing behavior. Read this index, then use the matching feature file as the recipe. Keep it in step with the app: when a route, label or rule changes, change its file.

## Baseline preconditions

- `C=.agents/skills/verify-artnote/control.sh`, run from the worktree root.
- `$C launch` printed `READY http://localhost:<port>`, and `$C doctor` exits 0.
- `U` holds the base URL: `U=$(sed -nE 's/^BASE_URL="?([^"]*)"?$/\1/p' .env)`.
- The database is as seeded (3 notices, 2 places, 3 artists, 4 accounts) plus nothing titled `[QA]…`. If an earlier run left `[QA]` rows, run `$C cleanup` and `$C launch` again.
- Never drive an instance `doctor` says belongs to another worktree.

## Driving conventions

- Sign in through the UI with `$C signin <account>`; get the session name with `S=$($C session <account>)`.
- Target elements with Playwright role locators and the exact French names written in each file.
- Name everything you create `[QA] …`.
- Wait for the observable result (URL, text, row), not a fixed sleep.

## Proof and skip reporting

- Make an evidence directory per feature run: `E=$($C evidence <feature-id>)`.
- UI proof: an ARIA snapshot (`--raw snapshot … > "$E/<step>.aria.yml"`) and a screenshot (`screenshot --filename="$E/<step>.png"`) of the state before and after the action.
- Mutation proof: a read-only second view, `$C sql "…" > "$E/<step>.db.txt"`, and where it applies the public page.
- Record which entry point you used. Report an entry point you could not reach with the command you ran and the unmet precondition; do not report it as verified through another path.

## Feature entry contract

Each file has an H1, one paragraph of user-visible behavior, then exactly four H2s in this order: `Sub-features`, `How to get to it (user POV)`, `Driving it with playwright-cli` (starting with `Preconditions:`), `Gotchas`.

## Features

- [Sign-in and access](./sign-in.md): header sign-in dialog, the four seeded roles, dashboard refusal, sign-out.
- [Dashboard notices](./dashboard-notices.md): a writer creates, edits, publishes and deletes their own notices; another writer cannot see them.
- [Public notices](./public-notices.md): the reader's notice list, search and sort, the notice page, and drafts kept private.
- [Places and artists](./places-artists.md): server-paginated dashboard tables with filters, create forms and row actions.

Not yet mapped: user management (`/dashboard/users`), profile and avatar upload (`/profile`), image attachments in the notice editor, notice preview (`/artworks/<id>/preview`), `/whats-new`.
