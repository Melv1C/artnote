# One local database and dev port per worktree

Agents and people work in parallel git worktrees, so `bun run db:setup` gives each worktree its own database (named after the folder) in one shared Docker Postgres, and its own dev port in 3100–3999, written once to that worktree's `.env`. One container keeps resource use low; separate databases let a worktree seed or reset without touching another. The dev server refuses to move to another port, because Better Auth only accepts its configured origin. Local scripts refuse any non-local database.
