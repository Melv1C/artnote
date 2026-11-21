import { assertLocalDatabase } from './assert-local-db';

const E2E_PORT_OFFSET = 1000;
const POSTGRES_NAME_LIMIT = 63;
const SUFFIX = '_e2e';

/**
 * Where the end-to-end run serves the app and keeps its data: a database of its own beside this
 * worktree's (`<name>_e2e`, recreated on every run), and the dev port plus 1000, so it never
 * touches the worktree's data or collides with its dev server.
 */
export function e2eEnv(env: { BASE_URL?: string; PRISMA_DATABASE_URL?: string }) {
  const database = new URL(assertLocalDatabase(env.PRISMA_DATABASE_URL));
  const name = database.pathname.slice(1).slice(0, POSTGRES_NAME_LIMIT - SUFFIX.length);
  database.pathname = `/${name}${SUFFIX}`;

  const base = new URL(env.BASE_URL ?? 'http://localhost:3000');
  base.port = String((Number(base.port) || 3000) + E2E_PORT_OFFSET);

  return { BASE_URL: base.origin, PRISMA_DATABASE_URL: database.toString() };
}
