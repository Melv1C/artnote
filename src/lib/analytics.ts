// Client-side analytics utilities for cookie consent and event tracking

export type AnalyticsEventType =
  | 'page_view_start'
  | 'page_view_end'
  | 'notice_view_start'
  | 'notice_view_end'
  | 'cookie_accept'
  | 'cookie_reject'
  | 'interaction';

export type PageCategory = 'home' | 'notice' | 'about' | 'dashboard' | 'other';

export interface AnalyticsEventPayload {
  eventType: AnalyticsEventType;
  timestamp?: string;
  visitorId?: string | null;
  sessionId?: string | null;
  noticeId?: string | null;
  path?: string | null;
  pageCategory?: PageCategory | null;
  referrer?: string | null;
  durationMs?: number | null;
  meta?: Record<string, unknown> | null;
}

const VISITOR_COOKIE_NAME = 'visitor_id';
const CONSENT_COOKIE_NAME = 'cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

/**
 * Set the visitor ID cookie (only when user accepts cookies)
 */
export function setVisitorCookie(visitorId: string): void {
  document.cookie = `${VISITOR_COOKIE_NAME}=${visitorId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get the visitor ID from cookie
 */
export function getVisitorCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(c => c.startsWith(`${VISITOR_COOKIE_NAME}=`));
  return match?.split('=')[1] ?? null;
}

/**
 * Set consent cookie to track user's cookie preference
 */
export function setConsentCookie(accepted: boolean): void {
  const value = accepted ? 'accepted' : 'rejected';
  document.cookie = `${CONSENT_COOKIE_NAME}=${value}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Get consent status from cookie
 */
export function getConsentStatus(): 'accepted' | 'rejected' | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.split('; ').find(c => c.startsWith(`${CONSENT_COOKIE_NAME}=`));
  const value = match?.split('=')[1];
  if (value === 'accepted' || value === 'rejected') return value;
  return null;
}

/**
 * Clear visitor cookie (when user rejects cookies)
 */
export function clearVisitorCookie(): void {
  document.cookie = `${VISITOR_COOKIE_NAME}=; Path=/; Max-Age=0`;
}

/**
 * Generate a new UUID for visitor or session
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Send analytics event to server
 * Uses fetch for most events, falls back gracefully on errors
 */
export async function sendEvent(payload: AnalyticsEventPayload): Promise<void> {
  try {
    const eventPayload = {
      ...payload,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    };

    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
  } catch {
    // Silently fail - analytics should not break the app
  }
}

/**
 * Send analytics event using sendBeacon (for unload events)
 * More reliable for events sent when page is closing
 */
export function sendBeaconEvent(payload: AnalyticsEventPayload): void {
  try {
    const eventPayload = {
      ...payload,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    };

    navigator.sendBeacon('/api/analytics', JSON.stringify(eventPayload));
  } catch {
    // Silently fail
  }
}

/**
 * Extract domain from referrer URL
 */
export function extractDomain(url: string | null): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Truncate path to max length
 */
export function truncatePath(path: string | null, maxLength = 200): string | null {
  if (!path) return null;
  return path.length > maxLength ? path.slice(0, maxLength) : path;
}

/**
 * Categorize a path into a page category for aggregation
 */
export function categorizePagePath(path: string): PageCategory {
  const normalizedPath = path.toLowerCase();

  if (normalizedPath === '/' || normalizedPath === '') {
    return 'home';
  }
  if (normalizedPath.startsWith('/artworks/') && normalizedPath !== '/artworks') {
    return 'notice';
  }
  if (normalizedPath === '/about' || normalizedPath.startsWith('/about/')) {
    return 'about';
  }
  if (normalizedPath.startsWith('/dashboard')) {
    return 'dashboard';
  }
  return 'other';
}
