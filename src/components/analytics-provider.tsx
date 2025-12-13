'use client';

import {
  categorizePagePath,
  extractDomain,
  generateUUID,
  getVisitorCookie,
  sendBeaconEvent,
  sendEvent,
  truncatePath,
} from '@/lib/analytics';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

// Session ID stored in memory - persists across SPA route changes, resets on browser close
let globalSessionId: string | null = null;

function getSessionId(): string {
  if (!globalSessionId) {
    globalSessionId = generateUUID();
  }
  return globalSessionId;
}

/**
 * Provider component that tracks page views across all routes
 * Place this in your root layout to automatically track all page navigations
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const startTimeRef = useRef<number | null>(null);
  const lastPathRef = useRef<string | null>(null);
  const hasEndedRef = useRef(false);

  const sendEndEvent = useCallback((path: string, durationMs: number) => {
    const visitorId = getVisitorCookie();
    const sessionId = getSessionId();
    const pageCategory = categorizePagePath(path);

    sendBeaconEvent({
      eventType: 'page_view_end',
      path: truncatePath(path),
      pageCategory,
      sessionId,
      visitorId,
      durationMs,
    });
  }, []);

  useEffect(() => {
    // Skip if same path (shouldn't happen but safety check)
    if (lastPathRef.current === pathname) return;

    // Send end event for previous page if exists
    if (lastPathRef.current && startTimeRef.current && !hasEndedRef.current) {
      const durationMs = Date.now() - startTimeRef.current;
      sendEndEvent(lastPathRef.current, durationMs);
    }

    // Start tracking new page
    const visitorId = getVisitorCookie();
    const sessionId = getSessionId();
    const pageCategory = categorizePagePath(pathname);

    startTimeRef.current = Date.now();
    lastPathRef.current = pathname;
    hasEndedRef.current = false;

    // Send start event
    sendEvent({
      eventType: 'page_view_start',
      path: truncatePath(pathname),
      pageCategory,
      referrer: extractDomain(document.referrer),
      sessionId,
      visitorId,
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && startTimeRef.current && !hasEndedRef.current) {
        hasEndedRef.current = true;
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(pathname, durationMs);
      }
    };

    // Handle page unload
    const handleBeforeUnload = () => {
      if (startTimeRef.current && !hasEndedRef.current) {
        hasEndedRef.current = true;
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(pathname, durationMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname, sendEndEvent]);

  return <>{children}</>;
}
