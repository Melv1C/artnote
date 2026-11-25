import '@tanstack/react-start/server-only';
import { parseEnv } from './env-schema';

/**
 * Validated server environment: an invalid variable fails at startup, and so does a missing
 * `BETTER_AUTH_SECRET` in production. Import `env` instead of reading `process.env`.
 */
export const env = parseEnv(process.env);

export const isProduction = env.NODE_ENV === 'production';
