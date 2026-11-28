// Imports the generated Prisma client: import it only once `prisma generate` has run.
import { execFileSync } from 'node:child_process';
import { createPrismaClient } from '../src/lib/prisma-client';
import { assertLocalDatabase } from './assert-local-db';
import { databaseName } from './worktree-env';

/**
 * Create the database PRISMA_DATABASE_URL names if it does not exist, dropping it first with
 * `drop`, then migrate and seed it. Refuses a database that is not on localhost.
 */
export async function prepareLocalDatabase({ drop }: { drop: boolean }) {
  const url = assertLocalDatabase(process.env.PRISMA_DATABASE_URL);
  const name = databaseName(url);

  // DROP and CREATE DATABASE run from the server's maintenance database, outside a transaction
  const maintenance = new URL(url);
  maintenance.pathname = '/postgres';
  const prisma = createPrismaClient(maintenance.toString());
  try {
    if (drop) {
      await prisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
      console.log(`Dropped database ${name}`);
    }
    const existing = await prisma.$queryRaw<unknown[]>`
      SELECT 1 FROM pg_database WHERE datname = ${name}`;
    if (existing.length === 0) {
      await prisma.$executeRawUnsafe(`CREATE DATABASE "${name}"`);
      console.log(`Created database ${name}`);
    }
  } finally {
    await prisma.$disconnect();
  }

  execFileSync('prisma', ['migrate', 'deploy'], { stdio: 'inherit' });
  execFileSync('prisma', ['db', 'seed'], { stdio: 'inherit' });
}
