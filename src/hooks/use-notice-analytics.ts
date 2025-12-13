'use client';

import {
  categorizePagePath,
  extractDomain,
  generateUUID,
  getVisitorCookie,
  sendBeaconEvent,
  sendEvent,
  truncatePath,
  type PageCategory,
} from '@/lib/analytics';
import { useCallback, useEffect, useRef } from 'react';

// Session ID stored in memory - persists across SPA route changes, resets on browser close
let globalSessionId: string | null = null;

function getSessionId(): string {
  if (!globalSessionId) {
    globalSessionId = generateUUID();
  }
  return globalSessionId;
}

interface UseNoticeAnalyticsOptions {
  noticeId: string;
  path?: string;
}

/**
 * Hook to track notice (artwork) view analytics
 * Sends notice_view_start on mount and notice_view_end on unmount or visibility change
 */
export function useNoticeAnalytics({ noticeId, path }: UseNoticeAnalyticsOptions): void {
  const startTimeRef = useRef<number | null>(null);
  const hasEndedRef = useRef(false);

  const sendEndEvent = useCallback(
    (durationMs: number) => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;

      const visitorId = getVisitorCookie();
      const sessionId = getSessionId();

      sendBeaconEvent({
        eventType: 'notice_view_end',
        noticeId,
        path: truncatePath(
          path ?? (typeof window !== 'undefined' ? window.location.pathname : null),
        ),
        sessionId,
        visitorId,
        durationMs,
      });
    },
    [noticeId, path],
  );

  useEffect(() => {
    const visitorId = getVisitorCookie();
    const sessionId = getSessionId();

    // Record start time
    startTimeRef.current = Date.now();
    hasEndedRef.current = false;

    // Send start event
    sendEvent({
      eventType: 'notice_view_start',
      noticeId,
      path: truncatePath(path ?? window.location.pathname),
      referrer: extractDomain(document.referrer),
      sessionId,
      visitorId,
    });

    // Handle visibility change (user switches tab or minimizes)
    const handleVisibilityChange = () => {
      if (document.hidden && startTimeRef.current && !hasEndedRef.current) {
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(durationMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup - send end event on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (startTimeRef.current && !hasEndedRef.current) {
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(durationMs);
      }
    };
  }, [noticeId, path, sendEndEvent]);
}

/**
 * Hook to track page views with duration (for all pages)
 * Sends page_view_start on mount and page_view_end on unmount/visibility change
 */
export function usePageAnalytics(path?: string): void {
  const startTimeRef = useRef<number | null>(null);
  const hasEndedRef = useRef(false);
  const currentPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const pageCategory = categorizePagePath(currentPath);

  const sendEndEvent = useCallback(
    (durationMs: number) => {
      if (hasEndedRef.current) return;
      hasEndedRef.current = true;

      const visitorId = getVisitorCookie();
      const sessionId = getSessionId();

      sendBeaconEvent({
        eventType: 'page_view_end',
        path: truncatePath(currentPath),
        pageCategory,
        sessionId,
        visitorId,
        durationMs,
      });
    },
    [currentPath, pageCategory],
  );

  useEffect(() => {
    const visitorId = getVisitorCookie();
    const sessionId = getSessionId();

    // Record start time
    startTimeRef.current = Date.now();
    hasEndedRef.current = false;

    // Send start event
    sendEvent({
      eventType: 'page_view_start',
      path: truncatePath(currentPath),
      pageCategory,
      referrer: extractDomain(document.referrer),
      sessionId,
      visitorId,
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && startTimeRef.current && !hasEndedRef.current) {
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(durationMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (startTimeRef.current && !hasEndedRef.current) {
        const durationMs = Date.now() - startTimeRef.current;
        sendEndEvent(durationMs);
      }
    };
  }, [currentPath, pageCategory, sendEndEvent]);
}

/**
 * Function to track interactions (clicks, etc.)
 */
export function trackInteraction(
  interactionType: string,
  noticeId?: string,
  meta?: Record<string, unknown>,
): void {
  const visitorId = getVisitorCookie();
  const sessionId = getSessionId();
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  sendEvent({
    eventType: 'interaction',
    noticeId,
    path: truncatePath(currentPath),
    pageCategory: categorizePagePath(currentPath),
    sessionId,
    visitorId,
    meta: { interactionType, ...meta },
  });
}

// Re-export for convenience
export { getSessionId, type PageCategory };
