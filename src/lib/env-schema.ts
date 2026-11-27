import { z } from '@/lib/zod';
import { DEFAULT_BASE_URL } from './base-url';

const DEV_AUTH_SECRET = 'dev-only-better-auth-secret';
const STORAGE_KEYS = [
  'S3_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_PUBLIC_URL',
] as const;

const envSchema = z
  .object({
    NODE_ENV: z.string().optional(),
    // Public origin of the app: Better Auth base URL, absolute Open Graph URLs, and the port the
    // dev server listens on
    BASE_URL: z.url().optional(),
    // Host of a Dokploy preview deployment, without a protocol. Dokploy sets it on previews only;
    // it replaces BASE_URL so Better Auth accepts sign-ins on the preview's own host.
    DOKPLOY_DEPLOY_URL: z.string().optional(),
    PRISMA_DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(10).optional(),
    // Bearer token the scheduled job sends to /api/cron/*
    CRON_SECRET: z.string().min(16).optional(),
    // Header that carries the visitor's IP for the view count, set by the reverse proxy in front
    // of the app (Traefik's `x-real-ip` on Dokploy). Only name a header the proxy overwrites:
    // a client can send any header. Unset, views are not counted (local dev server).
    CLIENT_IP_HEADER: z
      .string()
      .regex(/^[A-Za-z0-9-]+$/)
      .transform(name => name.toLowerCase())
      .optional(),
    // S3-compatible object storage (MinIO) for image and avatar uploads. All five or none;
    // without them uploads fail.
    S3_ENDPOINT: z.url().optional(),
    S3_BUCKET: z.string().min(3).optional(),
    S3_ACCESS_KEY_ID: z.string().min(3).optional(),
    S3_SECRET_ACCESS_KEY: z.string().min(8).optional(),
    // Public base URL of the bucket's objects, such as https://files.artnote.melvyn.be/artnote
    S3_PUBLIC_URL: z.url().optional(),
    // Umami Cloud website id (ADR 0010). Not a secret: it ends up in page HTML. Set in
    // production only; where it is unset, no tracker loads and nothing is measured.
    UMAMI_WEBSITE_ID: z.uuid().optional(),
    // `true` in production only: elsewhere (staging, previews, the dev server) every response
    // carries `X-Robots-Tag: noindex` and /robots.txt disallows everything.
    ALLOW_INDEXING: z.stringbool().default(false),
  })
  .superRefine((env, ctx) => {
    // Only a local dev server may fall back to the public dev secret
    if (env.NODE_ENV === 'production' && !env.BETTER_AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['BETTER_AUTH_SECRET'],
        message: 'required when NODE_ENV=production',
      });
    }
    const storageKeys = STORAGE_KEYS.filter(key => env[key] !== undefined);
    if (storageKeys.length > 0 && storageKeys.length < STORAGE_KEYS.length) {
      for (const key of STORAGE_KEYS.filter(key => env[key] === undefined)) {
        ctx.addIssue({ code: 'custom', path: [key], message: 'set all S3_* variables, or none' });
      }
    }
  })
  .transform(
    ({
      DOKPLOY_DEPLOY_URL,
      S3_ENDPOINT,
      S3_BUCKET,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
      S3_PUBLIC_URL,
      ...env
    }) => ({
      ...env,
      BASE_URL: DOKPLOY_DEPLOY_URL
        ? withProtocol(DOKPLOY_DEPLOY_URL)
        : (env.BASE_URL ?? DEFAULT_BASE_URL),
      BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET,
      storage:
        S3_ENDPOINT && S3_BUCKET && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY && S3_PUBLIC_URL
          ? {
              endpoint: S3_ENDPOINT,
              bucket: S3_BUCKET,
              accessKeyId: S3_ACCESS_KEY_ID,
              secretAccessKey: S3_SECRET_ACCESS_KEY,
              publicUrl: S3_PUBLIC_URL.replace(/\/+$/, ''),
            }
          : null,
    }),
  );

export type Env = z.output<typeof envSchema>;

function withProtocol(url: string) {
  return /^https?:\/\//.test(url) ? url : `https://${url}`;
}

/**
 * Parse environment variables, throwing one error that lists every invalid variable.
 */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment variables:\n${issues.join('\n')}`);
  }
  return result.data;
}
