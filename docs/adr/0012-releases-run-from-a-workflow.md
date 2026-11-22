---
status: accepted
supersedes: ADR 0009
---

# Releases run from a workflow that bumps the version

Nobody pushes to `main`, `v*` tags or `production`: `main` changes only through a PR with a passing Check, and tags and `production` only through workflows. A release is the Release workflow, started by hand from the Actions tab with `patch`, `minor` or `major`. It refuses to run unless `main`'s HEAD passed Check, runs `vp pm version` (Bun's `bun pm version`) to commit `chore(release): vX.Y.Z` with `package.json` as the only change, pushes that commit and its tag to `main` together, creates the GitHub Release with generated notes, and force-pushes `production` to the tag, which Dokploy deploys. `package.json` therefore always holds the version in production. The Rollback workflow moves `production` to an earlier tag and changes nothing else.

Rulesets protect `main`, `v*` tags and `production`, and their one bypass actor is a deploy key that both workflows push with. The key is the `RELEASE_DEPLOY_KEY` secret of a `release` environment that only `main` may deploy to, so a workflow edited on another branch cannot read it; both workflows run from `main`. The `production` branch from ADR 0009 stays as the pointer Dokploy deploys from; tags remain the release history.

## Considered options

- **Push a tag by hand (ADR 0009)**: simple, but `package.json` never held the version, and anyone with push access could release any commit.
- **A version-bump PR whose merge releases**: needs no bypass, but every release is a PR to open, wait for and merge; and a bump PR opened by a workflow's own token never triggers CI, so it could not be automated without a token anyway.
- **The workflow's own `GITHUB_TOKEN` as the bypass**: GitHub does not accept it as a ruleset bypass actor.
- **A GitHub App or a personal access token as the bypass**: an App is set up by hand in the UI, and a PAT acts as Melvyn and expires; a deploy key reaches this repository only.
- **Tags only, no `production` branch**: Dokploy builds a branch, not a tag (ADR 0011), so the workflow would drive Dokploy through its API. That puts a key to the whole Dokploy server in GitHub and needs the panel reachable from GitHub's runners.

## Consequences

- **The release commit itself has not passed CI** before it deploys: its parent has, and the workflow checks that the commit changes only `package.json`. CI runs on it once it reaches `main`.
- **Releasing needs `main` up to date**: if `main` moves while the workflow runs, the atomic push fails and nothing is released; run it again.
- **The deploy key can write to the repository past every rule.** It lives only in the secret; rotating it means a new deploy key and a new secret value.
- **A run that fails after its push is finished by hand**: the commit and tag are on `main` already, and running the workflow again would bump once more. Create the missing Release with `gh release create vX.Y.Z --generate-notes`, and move `production` with the Rollback workflow and the new tag.
- **Rolling back does not undo migrations**: older code runs on the newer schema because migrations stay backward compatible (ADR 0006).
