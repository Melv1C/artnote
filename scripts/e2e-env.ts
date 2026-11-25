import { assertLocalDatabase } from './assert-local-db';
import { DEFAULT_BASE_URL, portOf } from '../src/lib/base-url';
import { databaseName, e2eDatabaseName, withDatabase } from './worktree-env';

const E2E_PORT_OFFSET = 1000;

/**
 * Where the end-to-end run serves the app and keeps its data: a database of its own beside this
 * worktree's (recreated on every run), and the dev port plus 1000, so it never touches the
 * worktree's data or collides with its dev server.
 */
export function e2eEnv(env: { BASE_URL?: string; PRISMA_DATABASE_URL?: string }) {
  const url = assertLocalDatabase(env.PRISMA_DATABASE_URL);
  const base = new URL(env.BASE_URL ?? DEFAULT_BASE_URL);
  base.port = String(portOf(base.href) + E2E_PORT_OFFSET);

  return {
    BASE_URL: base.origin,
    PRISMA_DATABASE_URL: withDatabase(url, e2eDatabaseName(databaseName(url))),
  };
}
