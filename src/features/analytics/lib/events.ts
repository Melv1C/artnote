import { z } from 'zod';

const AnalyticsEventTypeSchema = z.enum([
  'page_view_start',
  'page_view_end',
  'notice_view_start',
  'notice_view_end',
  'cookie_accept',
  'cookie_reject',
  'interaction',
]);

export const PageCategorySchema = z.enum(['home', 'notice', 'about', 'dashboard', 'other']);

export type AnalyticsEventType = z.infer<typeof AnalyticsEventTypeSchema>;
export type PageCategory = z.infer<typeof PageCategorySchema>;

const MAX_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_META_JSON_LENGTH = 1000;

/** Strings longer than `max` are cut, not rejected: the beacon must never fail on length. */
const truncated = (max: number) =>
  z
    .string()
    .nullish()
    .transform(value => (value ? value.slice(0, max) : null));

/**
 * What the browser posts to `/api/analytics`. Unknown fields are dropped; bad optional values
 * become null instead of failing the event.
 */
export const AnalyticsEventPayloadSchema = z.object({
  eventType: AnalyticsEventTypeSchema,
  timestamp: z.iso
    .datetime()
    .optional()
    .catch(undefined)
    .transform(value => (value ? new Date(value) : new Date())),
  visitorId: truncated(64),
  sessionId: truncated(64),
  noticeId: truncated(64),
  path: truncated(200),
  pageCategory: PageCategorySchema.nullish().catch(null),
  referrer: truncated(200),
  durationMs: z
    .number()
    .min(0)
    .nullish()
    .catch(null)
    .transform(value => (value == null ? null : Math.min(Math.round(value), MAX_DURATION_MS))),
  meta: z
    .record(z.string(), z.unknown())
    .nullish()
    .catch(null)
    .transform(value =>
      value && JSON.stringify(value).length <= MAX_META_JSON_LENGTH ? value : null,
    ),
});

export type AnalyticsEventPayload = z.input<typeof AnalyticsEventPayloadSchema>;

/** Page category used to break page views down in the dashboard. */
export function categorizePagePath(path: string): PageCategory {
  const normalized = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (normalized === '/') return 'home';
  if (normalized.startsWith('/artworks/')) return 'notice';
  if (normalized === '/about' || normalized.startsWith('/about/')) return 'about';
  if (normalized === '/dashboard' || normalized.startsWith('/dashboard/')) return 'dashboard';
  return 'other';
}

/** The hostname of a referrer URL, or null. Only the domain is stored. */
export function referrerDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname || null;
  } catch {
    return null;
  }
}
