// Set up this git worktree (`vp run worktree:setup`, run by t3.json after `vp install`): write
// its .env, start Postgres and MinIO, generate the Prisma client, create its database, migrate and
// seed it (ADR 0007).
import { parse } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename, join, resolve } from 'node:path';
import { assertLocalDatabase } from './assert-local-db';
import { loadEnvFiles } from './env-files';
import { buildWorktreeEnv, databaseName, worktreeDatabaseName } from './worktree-env';

const ENV_FILE = '.env';
const FIRST_DEV_PORT = 3100;
const DEV_PORT_RANGE = 900;

const reset = process.argv.includes('--reset');

const run = (command: string, ...args: string[]) =>
  execFileSync(command, args, { stdio: 'inherit' });

const read = (command: string, ...args: string[]) =>
  execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });

function worktreeSlug() {
  return basename(read('git', 'rev-parse', '--show-toplevel').trim())
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function isPortFree(port: number) {
  return new Promise<boolean>(resolve => {
    const server = createServer()
      .once('error', () => resolve(false))
      .once('listening', () => server.close(() => resolve(true)))
      .listen(port);
  });
}

async function pickDevPort(slug: string) {
  // The slug is ASCII ([a-z0-9_]), so code units are characters
  const offset = Array.from(slug, char => char.charCodeAt(0)).reduce(
    (hash, code) => (hash * 31 + code) >>> 0,
    0,
  );
  for (let i = 0; i < DEV_PORT_RANGE; i++) {
    const port = FIRST_DEV_PORT + ((offset + i) % DEV_PORT_RANGE);
    if (await isPortFree(port)) return port;
  }
  throw new Error(
    `No free port between ${FIRST_DEV_PORT} and ${FIRST_DEV_PORT + DEV_PORT_RANGE - 1}.`,
  );
}

/** The main checkout's .env: the first worktree `git worktree list` prints. Null when it has none. */
function readMainEnv() {
  const main = read('git', 'worktree', 'list', '--porcelain').match(/^worktree (.+)$/m)?.[1];
  if (!main || resolve(main) === resolve('.')) return null;
  const file = join(main, ENV_FILE);
  return existsSync(file) ? { file, content: readFileSync(file, 'utf8') } : null;
}

async function writeWorktreeEnv() {
  const slug = worktreeSlug();
  const database = worktreeDatabaseName(slug);
  const port = await pickDevPort(slug);
  const mainEnv = readMainEnv();
  const fromMain = parse(mainEnv?.content ?? '');

  const content = buildWorktreeEnv(readFileSync('.env.example', 'utf8'), mainEnv?.content ?? null, {
    BASE_URL: `http://localhost:${port}`,
    PRISMA_DATABASE_URL: `postgresql://artnote:artnote@localhost:5432/${database}`,
    // Secrets of its own, unless the main checkout's .env sets them
    ...(!fromMain.BETTER_AUTH_SECRET && {
      BETTER_AUTH_SECRET: randomBytes(32).toString('base64url'),
    }),
    ...(!fromMain.CRON_SECRET && { CRON_SECRET: randomBytes(24).toString('base64url') }),
  });
  // Owner-only: it can hold the staging QA passwords
  writeFileSync(ENV_FILE, content, { mode: 0o600 });

  const source = mainEnv ? `.env.example and ${mainEnv.file}` : '.env.example';
  console.log(
    `Wrote ${ENV_FILE} from ${source}: database ${database}, app on http://localhost:${port}`,
  );
}

if (!existsSync(ENV_FILE)) await writeWorktreeEnv();
loadEnvFiles();

// Before starting containers: refuse a database that is not local or has an unsafe name
databaseName(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));

run('docker', 'compose', 'up', '-d', '--wait', 'db', 'storage');
run('docker', 'compose', 'run', '--rm', 'storage-init');
run('prisma', 'generate');

// Imported once the Prisma client it uses is generated
const { prepareLocalDatabase } = await import('./local-database');
await prepareLocalDatabase({ drop: reset });

console.log(`\nReady. Run \`vp run dev\` and open ${process.env.BASE_URL}`);
