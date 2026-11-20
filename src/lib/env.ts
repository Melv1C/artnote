import '@tanstack/react-start/server-only';
import { parseEnv } from './env-schema';

/**
 * Validated server environment. Import `env` instead of reading `process.env`.
 * Outside development, missing secrets fail at startup instead of falling back to defaults.
 */
export const env = parseEnv(process.env);

export const isProduction = env.VERCEL_ENV === 'production';
