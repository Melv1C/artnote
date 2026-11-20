# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order, blockers first, never a single combined tickets file. A folder without `spec.md` holds a ticket alone.
- A ticket's `**Blocked by:**` line lists the numbers of the tickets that gate it, or `None`.
- Each file has a `**Status:**` line under its title (see **Status**).
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Status

| Status        | Spec (`spec.md`)                       | Ticket                                                                      |
| ------------- | -------------------------------------- | --------------------------------------------------------------------------- |
| `ready`       | written by `to-spec`                   | written by `to-tickets` or `wayfinder`                                      |
| `in-progress` | `conduct`: at least one ticket is open | `conduct` launched it; `wayfinder` claimed it                               |
| `review`      | n/a                                    | `conduct`: its PR is filed                                                  |
| `qa`          | `conduct`: every ticket is `done`      | `conduct`: a ticket alone, its PR merged                                    |
| `done`        | the user approved                      | its PR merged, the user approved a ticket alone, or `wayfinder` resolved it |

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed), with `**Status:** ready`.

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a file with one **child** file per ticket.

- **Map**: `.scratch/<effort>/map.md` (the Notes / Decisions-so-far / Fog body). The map carries no status.
- **Child ticket**: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body, a `**Type:**` line (`research`/`prototype`/`grilling`/`task`) and `**Status:** ready`.
- **Blocking**: a `**Blocked by:** NN, NN` line near the top. A ticket is unblocked when every file it lists is `done`.
- **Frontier**: scan `.scratch/<effort>/issues/` for files that are `ready` and unblocked; first by number wins.
- **Claim**: set `**Status:** in-progress` and save before any work.
- **Resolve**: append the answer under an `## Answer` heading, set `**Status:** done`, then append a context pointer (gist + link) to the map's Decisions-so-far in `map.md`.
- **Throwaway branches** (`research/<name>`, `prototype/<name>`): keep them local; nothing is pushed.

## Conducting operations

Used by `/conduct`. The **spec** is `.scratch/<feature>/spec.md`; its **tickets** are the files in `.scratch/<feature>/issues/`.

- **List tickets**: read every file in `.scratch/<feature>/issues/`, in number order.
- **Open blockers**: the tickets in a ticket's `**Blocked by:**` line whose status is not `done`.
- **Set status**: rewrite the `**Status:**` line in the main checkout. Ticket threads work in their own worktrees, which don't see this checkout's `.scratch/`, so only the orchestrator writes it, and a ticket thread gets the absolute path to its file in the main checkout.
- **Done**: nothing closes a file on merge. Set `**Status:** done` once the ticket's PR is merged (`gh pr view`).
- **Close**: append the approved comment under `## Comments` in `spec.md`, or in the ticket alone's file, and set its `**Status:** done`.
