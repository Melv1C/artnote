# Issue tracker: GitHub

Issues and specs for this repo live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --json number,title,body,labels,comments`.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Make an issue a sub-issue of a parent**: `gh issue create --parent <parent> ...`, or `gh issue edit <parent> --add-sub-issue <child>` afterwards (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<parent>/sub_issues -F sub_issue_id=<child-db-id>` (database id, as in **Blocking** below). Without sub-issues, put `Part of #<parent>` at the top of the child body.
- **Blocking**: GitHub's **native issue dependencies**, the canonical, UI-visible representation. Add an edge with `gh issue create --blocked-by <n>,<n> ...` or `gh issue edit <child> --add-blocked-by <blocker>` (`gh` 2.94+). Older `gh`: `gh api --method POST repos/<owner>/<repo>/issues/<child>/dependencies/blocked_by -F issue_id=<blocker-db-id>`, where `<blocker-db-id>` is the blocker's numeric **database id** (`gh api repos/<owner>/<repo>/issues/<n> --jq .id`, _not_ the `#number` or `node_id`). Where dependencies aren't available, fall back to a `Blocked by: #<n>, #<n>` line at the top of the child body. A ticket is unblocked when every blocker is closed.
- **Count open blockers**: `gh api repos/<owner>/<repo>/issues/<n> --jq .issue_dependencies_summary.blocked_by` (open blockers only; 0 means startable). `gh issue view <n> --json blockedBy` also lists closed blockers, so filter it: `--jq '[.blockedBy.nodes[] | select(.state == "OPEN")] | length'`.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Posting**: every issue, comment and description goes out under the user's account, so follow the `forge-communication` skill for each one (attribution, secrets check, read back). Running a skill that reads this doc is the user's ask for the posts and closes it describes on the issues it creates or works, and for nothing else.
- **Close**: post the explanation with `gh issue comment <number> --body "..."`, then `gh issue close <number>`. On an already-closed issue, `gh issue close --comment` drops the comment and still exits 0.

Infer the repo from `git remote -v`; `gh` does this automatically when run inside a clone.

File issues only into this repo. In a fork, `gh` can default to the upstream parent, so before the first `gh issue create` of a session, check the target with `gh repo view --json nameWithOwner` and confirm it with the user if it is not their repo.

## Status

A status is a label. An issue carries at most one; setting one removes the others.

| Status      | Label                | Set by                                                                                       |
| ----------- | -------------------- | -------------------------------------------------------------------------------------------- |
| ready       | `status:ready`       | `to-tickets` and `wayfinder` on each ticket they create; a spec carries no label while ready |
| in-progress | `status:in-progress` | `conduct` on a launched ticket and on its spec; `wayfinder` on a claimed ticket              |
| review      | `status:review`      | `conduct`, once a ticket's PR is filed                                                       |
| qa          | `status:qa`          | `conduct`, once the spec's tickets are done or a ticket alone merged                         |
| done        | closed, no label     | whoever closes it                                                                            |

`wayfinder:map`, `wayfinder:research`, `wayfinder:prototype`, `wayfinder:grilling` and `wayfinder:task` are **type** labels, not statuses: `wayfinder` keeps them alongside the status.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Read it as in **Read an issue** above.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. `gh issue create --label wayfinder:map`. The map carries no status.
- **Child ticket**: an issue linked to the map as a GitHub sub-issue (see **Make an issue a sub-issue of a parent**). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`) and `status:ready`.
- **Blocking**: see **Blocking** under Conventions.
- **Frontier query**: list the map's open children labelled `status:ready` (`gh issue list --state open --label status:ready`, scoped to the map's sub-issues / task list), drop any with an open blocker (see **Count open blockers**, or an open issue in the `Blocked by` line); first in map order wins.
- **Claim**: `gh issue edit <n> --add-label status:in-progress --remove-label status:ready`, the session's first write.
- **Resolve**: `gh issue comment <n> --body "<answer>"`, then `gh issue close <n> && gh issue edit <n> --remove-label status:in-progress`, then append a context pointer (gist + link) to the map's Decisions-so-far.
- **Editing the map body**: a body is saved whole, never merged, so two sessions editing the map at once lose one's change. Re-read the map right before every edit, change only your own lines, and read it back after saving; restore any line that vanished.
- **Throwaway branches** (`research/<name>`, `prototype/<name>`): push them so other sessions can read them; never open a PR.

## Conducting operations

Used by `/conduct`. The **spec** is an issue; its **tickets** are its sub-issues.

- **List tickets**: `gh api repos/<owner>/<repo>/issues/<spec>/sub_issues --jq '.[] | {number, title, state, labels: [.labels[].name]}'`. Without sub-issues, the open and closed issues whose body starts with `Part of #<spec>`: `gh issue list --state all --search '"Part of #<spec>" in:body'`.
- **Open blockers**: see **Count open blockers** under Conventions.
- **Set status**: add the new status label and remove the one the issue carries, in one call: `gh issue edit <n> --add-label status:review --remove-label status:in-progress`.
- **Done**: nothing closes the ticket on merge. Once its PR has merged (`gh pr view`), close it with `gh issue close <n>` and remove its last status label.
- **Close**: the spec or the ticket alone, as **Close** under Conventions, after the user approves the comment; then remove its `status:qa` label.
