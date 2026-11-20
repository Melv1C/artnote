import { referrerDomain } from '../lib/events';
import { useTrackedView } from './use-tracked-view';

/**
 * Track a timed view of a notice's public page, for per-notice stats. Keyed on the notice only:
 * the route location changes before the page unmounts, and must not start a new notice view.
 */
export function useNoticeViewTracking(noticeId: string) {
  // The URL of src/routes/artworks/$artworkId/index.tsx; update both together
  const path = `/artworks/${noticeId}`;

  useTrackedView(
    {
      eventType: 'notice_view_start',
      noticeId,
      path,
      referrer: typeof document === 'undefined' ? null : referrerDomain(document.referrer),
    },
    { eventType: 'notice_view_end', noticeId, path },
  );
}
