import { useEffect, useEffectEvent } from 'react';
import { noticeReadingEvent } from '../lib/umami';
import { withUmami } from './use-umami-page-views';

/**
 * Sends one Umami `notice_read` when the reader leaves the notice's page or hides the tab, whichever
 * comes first, timed from arrival. The URL is set to the notice's own path: on leaving, the browser
 * already shows the next page.
 */
export function useNoticeReading(noticeId: string, title: string) {
  // A reading is keyed on the notice only; the title is read when it starts
  const readTitle = useEffectEvent(() => title);

  useEffect(() => {
    const noticeTitle = readTitle();
    // The URL of src/routes/artworks/$artworkId/index.tsx; update both together
    const url = new URL(`/artworks/${noticeId}`, window.location.origin).href;
    const startedAt = Date.now();
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      const event = noticeReadingEvent({
        noticeId,
        title: noticeTitle,
        durationMs: Date.now() - startedAt,
      });
      withUmami(umami => umami.track(props => ({ ...props, ...event, url })));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') finish();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      finish();
    };
  }, [noticeId]);
}
