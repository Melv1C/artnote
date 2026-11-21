import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { isMeasuredPath } from '../lib/umami';

type UmamiPayload = Record<string, unknown> & { url?: string };
type Umami = { track: (payload: (props: UmamiPayload) => UmamiPayload) => unknown };

declare global {
  interface Window {
    umami?: Umami;
  }
}

/**
 * Runs `send` with Umami's tracker once it has loaded. Does nothing when the tracker is missing
 * (not configured, or blocked) and never throws: measurement must not break reading.
 * Returns a cleanup that cancels a send still waiting for the script.
 */
export function withUmami(send: (umami: Umami) => void): () => void {
  const run = () => {
    try {
      if (window.umami) send(window.umami);
    } catch (error) {
      console.error(error);
    }
  };
  // The tracker is deferred, so on the first page it may not have run yet; it has once the window
  // has loaded. Past that point, a missing tracker is not coming.
  if (window.umami || document.readyState === 'complete') {
    run();
    return () => {};
  }
  window.addEventListener('load', run, { once: true });
  return () => window.removeEventListener('load', run);
}

/**
 * Sends one Umami page view for each public path the reader opens (`isMeasuredPath`). The tracker's
 * own automatic page views are off. It follows pushState navigation for the referrer, but not back
 * and forward, so the URL is set from the router's path (which carries no query string).
 */
export function useUmamiPageViews() {
  const path = useLocation({ select: location => location.pathname });
  useEffect(() => {
    if (!isMeasuredPath(path)) return;
    return withUmami(umami =>
      umami.track(props => ({ ...props, url: new URL(path, window.location.origin).href })),
    );
  }, [path]);
}
