import { useLocation } from '@tanstack/react-router';
import { referrerDomain } from '../lib/events';
import { useTrackedView } from './use-tracked-view';

/** Track a timed view of a notice's public page, for per-notice stats. */
export function useNoticeViewTracking(noticeId: string) {
  const path = useLocation({ select: location => location.pathname });

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
