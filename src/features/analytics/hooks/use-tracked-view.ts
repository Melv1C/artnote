import { useEffect, useEffectEvent } from 'react';
import type { AnalyticsEventPayload } from '../lib/events';
import { sendBeaconEvent, sendEvent } from '../lib/tracking';

/**
 * Track a timed view: send `start` when the view begins, then `end` with the time spent when it
 * ends or the tab is hidden (whichever comes first). A new view begins whenever `start` changes
 * by value, so plain object literals are fine.
 */
export function useTrackedView(start: AnalyticsEventPayload, end: AnalyticsEventPayload) {
  const viewKey = JSON.stringify(start);
  const sendStart = useEffectEvent(() => sendEvent(start));
  const sendEnd = useEffectEvent((durationMs: number) => sendBeaconEvent({ ...end, durationMs }));

  useEffect(() => {
    const startedAt = Date.now();
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      sendEnd(Date.now() - startedAt);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') finish();
    };

    sendStart();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      finish();
    };
  }, [viewKey]);
}
