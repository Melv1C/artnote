// Recreate the end-to-end database from scratch: drop it, create it, migrate and seed it. Run by
// Playwright before it starts the dev server (playwright.config.ts), with PRISMA_DATABASE_URL set to
// the `<name>_e2e` database of scripts/e2e-env.ts. Only that throwaway database is ever dropped.
import { execFileSync } from 'node:child_process';
import { createPrismaClient } from '../src/lib/prisma-client';
import { assertLocalDatabase } from './assert-local-db';

const url = new URL(assertLocalDatabase(process.env.PRISMA_DATABASE_URL));
const name = decodeURIComponent(url.pathname.slice(1));
if (!/^[a-z0-9_]+_e2e$/.test(name)) {
  throw new Error(`Refusing to recreate "${name}": only a <name>_e2e database is throwaway.`);
}

// DROP and CREATE DATABASE run from the server's maintenance database, outside a transaction
const maintenance = new URL(url);
maintenance.pathname = '/postgres';
const prisma = createPrismaClient(maintenance.toString());
try {
  await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  await prisma.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
} finally {
  await prisma.$disconnect();
}

execFileSync('prisma', ['migrate', 'deploy'], { stdio: 'inherit' });
execFileSync('prisma', ['db', 'seed'], { stdio: 'inherit' });
console.log(`Recreated ${name} for the end-to-end run.`);
