import { describe, expect, it } from 'vite-plus/test';
import { missingSetup } from './preflight';

const ready = { dependencies: true, envFile: true, databaseUrl: false, prismaClient: true };

describe('missingSetup', () => {
  it('finds nothing missing in a set-up worktree', () => {
    expect(missingSetup('dev', ready)).toEqual([]);
    expect(missingSetup('check', ready)).toEqual([]);
  });

  it('reports a worktree whose setup never ran', () => {
    const fresh = { dependencies: false, envFile: false, databaseUrl: false, prismaClient: false };
    expect(missingSetup('check', fresh)).toEqual(['node_modules', '.env']);
    expect(missingSetup('dev', fresh)).toEqual(['node_modules', '.env', 'src/generated/prisma']);
  });

  it('lets check run without .env when PRISMA_DATABASE_URL is set, as in CI', () => {
    const ci = { dependencies: true, envFile: false, databaseUrl: true, prismaClient: false };
    expect(missingSetup('check', ci)).toEqual([]);
  });

  it('needs .env for dev, whose port and sign-in origin come from BASE_URL', () => {
    const noEnv = { ...ready, envFile: false, databaseUrl: true };
    expect(missingSetup('dev', noEnv)).toEqual(['.env']);
  });
});
