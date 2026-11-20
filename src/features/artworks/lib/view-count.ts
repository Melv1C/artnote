/** A notice's view counts once per client IP in this window. */
export const VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000;

/** Deduplication records are kept a day: well past the window, so pruning never re-opens one. */
const VIEW_RECORD_RETENTION_MS = 24 * 60 * 60 * 1000;

/** Records created before this moment can be deleted. */
export const viewRecordsExpireBefore = (now: Date) =>
  new Date(now.getTime() - Math.max(VIEW_RECORD_RETENTION_MS, VIEW_DEDUPLICATION_WINDOW_MS));

/**
 * The client IP from Vercel's `x-vercel-forwarded-for` header ("client, proxy…"), or null.
 * Only Vercel's header is trusted: `x-forwarded-for` and `x-real-ip` can be set by the client
 * when the app is not behind Vercel's proxy.
 */
export function clientIpFrom(vercelForwardedFor: string | null | undefined): string | null {
  return vercelForwardedFor?.split(',')[0]?.trim() || null;
}
