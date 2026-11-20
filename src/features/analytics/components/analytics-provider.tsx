import { useLocation } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTrackedView } from '../hooks/use-tracked-view';
import { categorizePagePath, referrerDomain } from '../lib/events';

/** Tracks a timed page view for every route. Mounted once in the root route. */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const path = useLocation({ select: location => location.pathname });
  const page = { path, pageCategory: categorizePagePath(path) };

  useTrackedView(
    {
      eventType: 'page_view_start',
      ...page,
      referrer: typeof document === 'undefined' ? null : referrerDomain(document.referrer),
    },
    { eventType: 'page_view_end', ...page },
  );

  return children;
}
