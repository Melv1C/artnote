import { describe, expect, it } from 'vite-plus/test';
import { e2eEnv } from './e2e-env';

describe('e2eEnv', () => {
  it("gives the end-to-end run its own database and port beside the worktree's", () => {
    expect(
      e2eEnv({
        BASE_URL: 'http://localhost:3790',
        PRISMA_DATABASE_URL: 'postgresql://artnote:artnote@localhost:5432/artnote_feat_x',
      }),
    ).toEqual({
      BASE_URL: 'http://localhost:4790',
      PRISMA_DATABASE_URL: 'postgresql://artnote:artnote@localhost:5432/artnote_feat_x_e2e',
    });
  });

  it("falls back to port 3000's neighbour when BASE_URL names no port", () => {
    expect(
      e2eEnv({
        BASE_URL: 'http://localhost',
        PRISMA_DATABASE_URL: 'postgresql://ci:ci@localhost:5432/ci',
      }).BASE_URL,
    ).toBe('http://localhost:4000');
  });

  it("keeps the database name within Postgres' 63 characters", () => {
    const long = `artnote_${'a'.repeat(60)}`;
    const { PRISMA_DATABASE_URL } = e2eEnv({
      BASE_URL: 'http://localhost:3100',
      PRISMA_DATABASE_URL: `postgresql://artnote:artnote@localhost:5432/${long}`,
    });
    const name = new URL(PRISMA_DATABASE_URL).pathname.slice(1);
    expect(name).toBe(`${long.slice(0, 59)}_e2e`);
  });

  it('refuses a database that is not local', () => {
    expect(() =>
      e2eEnv({
        BASE_URL: 'http://localhost:3100',
        PRISMA_DATABASE_URL: 'postgresql://u:p@db.example.com:5432/artnote',
      }),
    ).toThrow(/localhost/);
  });
});
