// No imports from node_modules: preflight.ts reads ENV_FILES before `vp install`.
import { existsSync } from 'node:fs';

/** The files the tools read configuration from, as the app does: `.env.local` wins over `.env`. */
export const ENV_FILES = ['.env.local', '.env'];

/** Load ENV_FILES into `process.env`. A variable already set in the environment wins over both. */
export function loadEnvFiles() {
  for (const file of ENV_FILES) if (existsSync(file)) process.loadEnvFile(file);
}
