// Read by the app, vite.config.ts and the scripts: no imports, so each can load it as is.

/** The public origin of a local dev server whose `.env` sets no `BASE_URL`. */
export const DEFAULT_BASE_URL = 'http://localhost:3000';

/** The port the app listens on for `baseUrl`, the default one when it names none. */
export const portOf = (baseUrl: string) =>
  Number(new URL(baseUrl).port) || Number(new URL(DEFAULT_BASE_URL).port);
