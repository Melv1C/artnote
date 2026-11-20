import { z } from 'zod';

const DEV_AUTH_SECRET = 'dev-only-better-auth-secret';
const FALLBACK_SITE_URL = 'https://artnote.vercel.app';

const envSchema = z
  .object({
    VERCEL_ENV: z.enum(['development', 'preview', 'production']).default('development'),
    // Better Auth base URL and the origin the dev server listens on
    BASE_URL: z.url().optional(),
    // Set by Vercel, without a protocol
    VERCEL_URL: z.string().optional(),
    VERCEL_BRANCH_URL: z.string().optional(),
    PRISMA_DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(10).optional(),
    BLOB_READ_WRITE_TOKEN: z.string().startsWith('vercel_blob_rw_').optional(),
    // Bearer token Vercel Cron sends to /api/cron/*
    CRON_SECRET: z.string().min(16).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.VERCEL_ENV !== 'development' && !env.BETTER_AUTH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['BETTER_AUTH_SECRET'],
        message: `required when VERCEL_ENV is ${env.VERCEL_ENV}`,
      });
    }
  })
  .transform(env => ({
    ...env,
    BASE_URL: env.BASE_URL ?? 'http://localhost:3000',
    BETTER_AUTH_SECRET: env.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET,
    // Absolute origin for Open Graph URLs: BASE_URL when set, else the Vercel deployment URL
    SITE_URL: withProtocol(
      env.BASE_URL ?? env.VERCEL_URL ?? env.VERCEL_BRANCH_URL ?? FALLBACK_SITE_URL,
    ),
  }));

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
