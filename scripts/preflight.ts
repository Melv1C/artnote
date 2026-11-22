// Runs first in `vp run dev` and `vp run check` (package.json): stop with the fix when this
// worktree was never set up, instead of a cryptic `prisma: command not found`. It imports nothing
// from node_modules, so it runs before `vp install`.
import { existsSync } from 'node:fs';

type Command = 'dev' | 'check';

type SetupState = {
  dependencies: boolean;
  envFile: boolean;
  /** PRISMA_DATABASE_URL set in the environment, as CI does instead of a .env */
  databaseUrl: boolean;
  prismaClient: boolean;
};

/** What `command` needs that this checkout lacks, by path. */
export function missingSetup(command: Command, state: SetupState): string[] {
  const missing: string[] = [];
  if (!state.dependencies) missing.push('node_modules');
  // `check` generates the client and needs only the database URL; `dev` reads BASE_URL from .env
  if (!state.envFile && (command === 'dev' || !state.databaseUrl)) missing.push('.env');
  if (command === 'dev' && !state.prismaClient) missing.push('src/generated/prisma');
  return missing;
}

if (import.meta.main) {
  const command = process.argv[2];
  if (command !== 'dev' && command !== 'check') {
    throw new Error('Usage: vpx scripts/preflight.ts <dev|check>');
  }
  const missing = missingSetup(command, {
    dependencies: existsSync('node_modules/.bin/prisma'),
    envFile: existsSync('.env') || existsSync('.env.local'),
    databaseUrl: Boolean(process.env.PRISMA_DATABASE_URL),
    prismaClient: existsSync('src/generated/prisma/client.ts'),
  });
  if (missing.length > 0) {
    console.error(
      `This checkout is not set up (missing ${missing.join(', ')}).\n` +
        'Run `vp install && vp run worktree:setup`, then try again.',
    );
    process.exit(1);
  }
}
