import { useEffect } from 'react';
import { recordNoticeView } from '../actions/artwork-mutations';
import { VIEW_DEDUPLICATION_WINDOW_MS } from '../lib/view-count';

// When each notice was last counted from this page load; also absorbs effects that run twice
// in development
const lastRecordedAt = new Map<string, number>();

/** Count one public view of a notice when its page mounts, at most once per dedup window. */
export function useRecordNoticeView(artworkId: string) {
  useEffect(() => {
    const now = Date.now();
    if (now - (lastRecordedAt.get(artworkId) ?? 0) < VIEW_DEDUPLICATION_WINDOW_MS) return;
    lastRecordedAt.set(artworkId, now);
    recordNoticeView({ data: artworkId }).catch(error => {
      // Allow a retry on the next visit
      lastRecordedAt.delete(artworkId);
      console.error('Recording notice view failed:', error);
    });
  }, [artworkId]);
}
