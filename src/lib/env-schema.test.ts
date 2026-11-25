import { describe, expect, it } from 'vite-plus/test';
import { parseEnv } from './env-schema';

const DATABASE = { PRISMA_DATABASE_URL: 'postgresql://artnote:artnote@localhost:5432/artnote' };

describe('parseEnv', () => {
  it('fills development defaults', () => {
    const env = parseEnv(DATABASE);
    expect(env.BASE_URL).toBe('http://localhost:3000');
    expect(env.BETTER_AUTH_SECRET).toBeTruthy();
    expect(env.CRON_SECRET).toBeUndefined();
  });

  it('refuses a production server without an auth secret', () => {
    expect(() => parseEnv({ ...DATABASE, NODE_ENV: 'production' })).toThrow(/BETTER_AUTH_SECRET/);
    expect(
      parseEnv({ ...DATABASE, NODE_ENV: 'production', BETTER_AUTH_SECRET: 'a-real-secret' }),
    ).toMatchObject({ BETTER_AUTH_SECRET: 'a-real-secret' });
  });

  it("gives a Dokploy preview its own host as base URL, over the app's BASE_URL", () => {
    const env = parseEnv({
      ...DATABASE,
      BASE_URL: 'https://stg.artnote.melvyn.be',
      DOKPLOY_DEPLOY_URL: 'preview-artnote-abc123.artnote.melvyn.be',
    });
    expect(env.BASE_URL).toBe('https://preview-artnote-abc123.artnote.melvyn.be');
  });

  it('reads the client IP from no header unless one is named, lowercased', () => {
    expect(parseEnv(DATABASE).CLIENT_IP_HEADER).toBeUndefined();
    expect(parseEnv({ ...DATABASE, CLIENT_IP_HEADER: 'X-Real-Ip' }).CLIENT_IP_HEADER).toBe(
      'x-real-ip',
    );
    expect(() => parseEnv({ ...DATABASE, CLIENT_IP_HEADER: 'not a header' })).toThrow(
      /CLIENT_IP_HEADER/,
    );
  });

  it('groups the object storage settings, all or none', () => {
    expect(parseEnv(DATABASE).storage).toBeNull();
    const env = parseEnv({
      ...DATABASE,
      S3_ENDPOINT: 'http://artnote-minio:9000',
      S3_BUCKET: 'artnote',
      S3_ACCESS_KEY_ID: 'artnote-app',
      S3_SECRET_ACCESS_KEY: 'a-long-secret-key',
      S3_PUBLIC_URL: 'https://files.artnote.melvyn.be/artnote/',
    });
    expect(env.storage).toEqual({
      endpoint: 'http://artnote-minio:9000',
      bucket: 'artnote',
      accessKeyId: 'artnote-app',
      secretAccessKey: 'a-long-secret-key',
      publicUrl: 'https://files.artnote.melvyn.be/artnote',
    });
    expect(() => parseEnv({ ...DATABASE, S3_BUCKET: 'artnote' })).toThrow(/S3_ENDPOINT/);
  });
});
