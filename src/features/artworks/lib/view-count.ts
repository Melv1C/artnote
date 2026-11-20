/** A notice's view counts once per client IP in this window. */
export const VIEW_DEDUPLICATION_WINDOW_MS = 30 * 60 * 1000;

/**
 * The client IP from Vercel's `x-vercel-forwarded-for` header ("client, proxy…"), or null.
 * Only Vercel's header is trusted: `x-forwarded-for` and `x-real-ip` can be set by the client
 * when the app is not behind Vercel's proxy.
 */
export function clientIpFrom(vercelForwardedFor: string | null | undefined): string | null {
  return vercelForwardedFor?.split(',')[0]?.trim() || null;
}
