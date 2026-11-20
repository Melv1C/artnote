import { config } from 'dotenv';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { basename } from 'node:path';
import { assertLocalDatabase } from './assert-local-db';

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
  throw new Error(`No free port between ${FIRST_DEV_PORT} and ${FIRST_DEV_PORT + DEV_PORT_RANGE}.`);
}

function setEnvLine(content: string, key: string, value: string) {
  const line = `${key}="${value}"`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  return pattern.test(content) ? content.replace(pattern, line) : `${content.trimEnd()}\n${line}\n`;
}

async function writeWorktreeEnv() {
  const slug = worktreeSlug();
  const database = `artnote_${slug}`.slice(0, 63);
  const port = await pickDevPort(slug);

  let content = readFileSync('.env.example', 'utf8');
  content = setEnvLine(content, 'BASE_URL', `http://localhost:${port}`);
  content = setEnvLine(
    content,
    'PRISMA_DATABASE_URL',
    `postgresql://artnote:artnote@localhost:5432/${database}`,
  );
  content = setEnvLine(content, 'BETTER_AUTH_SECRET', randomBytes(32).toString('base64url'));
  content = setEnvLine(content, 'CRON_SECRET', randomBytes(24).toString('base64url'));
  writeFileSync(ENV_FILE, content);

  console.log(`Wrote ${ENV_FILE}: database ${database}, app on http://localhost:${port}`);
}

function databaseFromUrl(url: string) {
  const { pathname, username } = new URL(url);
  const name = decodeURIComponent(pathname.slice(1));
  if (!/^[a-z0-9_]+$/.test(name)) {
    throw new Error(`Database name "${name}" must be lowercase letters, digits and underscores.`);
  }
  return { name, user: decodeURIComponent(username) };
}

const psql = (user: string, sql: string) =>
  read(
    'docker',
    'compose',
    'exec',
    '-T',
    'db',
    'psql',
    '-v',
    'ON_ERROR_STOP=1',
    '-U',
    user,
    '-d',
    'postgres',
    '-tAc',
    sql,
  );

if (!existsSync(ENV_FILE)) await writeWorktreeEnv();

config({ path: '.env.local', quiet: true });
config({ path: ENV_FILE, quiet: true });

const database = databaseFromUrl(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));

run('docker', 'compose', 'up', '-d', '--wait', 'db');

if (reset) {
  psql(database.user, `DROP DATABASE IF EXISTS "${database.name}" WITH (FORCE)`);
  console.log(`Dropped database ${database.name}`);
}

if (
  psql(database.user, `SELECT 1 FROM pg_database WHERE datname = '${database.name}'`).trim() !== '1'
) {
  psql(database.user, `CREATE DATABASE "${database.name}"`);
  console.log(`Created database ${database.name}`);
}

run('prisma', 'migrate', 'deploy');
run('prisma', 'generate');
run('prisma', 'db', 'seed');

console.log(`\nReady. Run \`bun run dev\` and open ${process.env.BASE_URL}`);
