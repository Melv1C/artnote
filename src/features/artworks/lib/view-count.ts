/** A notice's view counts once per client IP in this window. */
export const VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000;

/** Deduplication records are kept a day: well past the window, so pruning never re-opens one. */
export const VIEW_RECORD_RETENTION_MS = 24 * 60 * 60 * 1000;

/** Records created before this moment can be deleted. */
export const viewRecordsExpireBefore = (now: Date) =>
  new Date(now.getTime() - Math.max(VIEW_RECORD_RETENTION_MS, VIEW_DEDUPLICATION_WINDOW_MS));

/**
 * The client IP from the header the reverse proxy sets (`CLIENT_IP_HEADER`), or null. Takes the
 * first entry of a "client, proxy…" list.
 */
export function clientIpFrom(header: string | null | undefined): string | null {
  return header?.split(',')[0]?.trim() || null;
}
