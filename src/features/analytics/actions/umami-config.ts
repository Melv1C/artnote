import { env } from '@/lib/env';
import { createServerFn } from '@tanstack/react-start';

/**
 * The Umami website id, or null where it is unset (everywhere but production): the root layout
 * loads Umami's tracker only when there is one. Public: the id ends up in every page's HTML anyway.
 */
export const getUmamiWebsiteId = createServerFn({ method: 'GET' }).handler(
  () => env.UMAMI_WEBSITE_ID ?? null,
);
