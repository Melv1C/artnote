// Browser-side analytics: the visit's session id and sending events. No cookie is set.
import type { AnalyticsEventPayload } from './events';

const ENDPOINT = '/api/analytics';

// One id per page load, shared by every tracker; kept in memory only (no cookie)
let sessionId: string | null = null;
const getSessionId = () => (sessionId ??= crypto.randomUUID());

const withContext = (payload: AnalyticsEventPayload): AnalyticsEventPayload => ({
  visitorId: null,
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
