---
status: superseded by ADR 0012
---

# Releases move a `production` branch to a version tag

`main` deploys to staging; production deploys from a `production` branch that only the Release workflow moves, to the commit of a pushed `vX.Y.Z` tag on `main`. The host deploys per branch (Vercel at first, Dokploy since ADR 0011), so a branch is the simplest production trigger, and tags give a named, reversible release history: rolling back is tagging an older commit. The workflow also creates the GitHub Release with generated notes.
