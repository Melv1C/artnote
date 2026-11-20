// Browser-side analytics: consent cookies, the visit's session id, and sending events.
import type { AnalyticsEventPayload } from './events';

const VISITOR_COOKIE = 'visitor_id';
const CONSENT_COOKIE = 'cookie_consent';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 2;
const ENDPOINT = '/api/analytics';

type ConsentStatus = 'accepted' | 'rejected';

const readCookie = (name: string) =>
  typeof document === 'undefined'
    ? null
    : (document.cookie
        .split('; ')
        .find(cookie => cookie.startsWith(`${name}=`))
        ?.split('=')[1] ?? null);

const writeCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) => {
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
};

export function getConsentStatus(): ConsentStatus | null {
  const value = readCookie(CONSENT_COOKIE);
  return value === 'accepted' || value === 'rejected' ? value : null;
}

/** Persistent visitor id, set only after the visitor accepts cookies. */
export const getVisitorId = () => readCookie(VISITOR_COOKIE);

/** Record the visitor's cookie choice: accepting creates a visitor id, rejecting removes it. */
export function setConsent(accepted: boolean): string | null {
  writeCookie(CONSENT_COOKIE, accepted ? 'accepted' : 'rejected');
  if (!accepted) {
    writeCookie(VISITOR_COOKIE, '', 0);
    return null;
  }
  const visitorId = crypto.randomUUID();
  writeCookie(VISITOR_COOKIE, visitorId);
  return visitorId;
}

// One id per page load, shared by every tracker; kept in memory only (no cookie)
let sessionId: string | null = null;
const getSessionId = () => (sessionId ??= crypto.randomUUID());

const withContext = (payload: AnalyticsEventPayload): AnalyticsEventPayload => ({
  visitorId: getVisitorId(),
  sessionId: getSessionId(),
  timestamp: new Date().toISOString(),
  ...payload,
});

/** Send an event. Never throws: analytics must not break the page. */
export function sendEvent(payload: AnalyticsEventPayload): void {
  fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(withContext(payload)),
    keepalive: true,
  }).catch(() => {});
}

/** Send an event while the page is being hidden or closed. */
export function sendBeaconEvent(payload: AnalyticsEventPayload): void {
  try {
    navigator.sendBeacon(ENDPOINT, JSON.stringify(withContext(payload)));
  } catch {
    // Analytics must not break the page
  }
}
