import { describe, expect, it } from 'vitest';
import { parseEnv } from './env-schema';

const DATABASE = { PRISMA_DATABASE_URL: 'postgresql://artnote:artnote@localhost:5432/artnote' };

describe('parseEnv', () => {
  it('fills development defaults', () => {
    const env = parseEnv(DATABASE);
    expect(env.VERCEL_ENV).toBe('development');
    expect(env.BASE_URL).toBe('http://localhost:3000');
    expect(env.BETTER_AUTH_SECRET).toBeTruthy();
    expect(env.CRON_SECRET).toBeUndefined();
  });

  it('refuses to start a deployed environment without an auth secret', () => {
    expect(() => parseEnv({ ...DATABASE, VERCEL_ENV: 'production' })).toThrow(/BETTER_AUTH_SECRET/);
    expect(() => parseEnv({ ...DATABASE, VERCEL_ENV: 'preview' })).toThrow(/BETTER_AUTH_SECRET/);
  });

  it('requires a database URL', () => {
    expect(() => parseEnv({})).toThrow(/PRISMA_DATABASE_URL/);
  });

  it('resolves the site URL from BASE_URL, else the Vercel URL with a protocol', () => {
    expect(parseEnv({ ...DATABASE, BASE_URL: 'https://artnote.be' }).SITE_URL).toBe(
      'https://artnote.be',
    );
    expect(parseEnv({ ...DATABASE, VERCEL_URL: 'artnote-abc.vercel.app' }).SITE_URL).toBe(
      'https://artnote-abc.vercel.app',
    );
  });
});
