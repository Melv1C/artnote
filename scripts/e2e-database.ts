// Recreate the end-to-end database from scratch: drop it, create it, migrate and seed it. Run by
// Playwright before it starts the dev server (playwright.config.ts), with PRISMA_DATABASE_URL set to
// the database of scripts/e2e-env.ts. Only that throwaway database is ever dropped.
import { assertLocalDatabase } from './assert-local-db';
import { prepareLocalDatabase } from './local-database';
import { databaseName, isE2eDatabaseName } from './worktree-env';

const name = databaseName(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));
if (!isE2eDatabaseName(name)) {
  throw new Error(`Refusing to recreate "${name}": only a <name>_e2e database is throwaway.`);
}

await prepareLocalDatabase({ drop: true });
