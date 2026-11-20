import { useEffect } from 'react';
import { recordNoticeView } from '../actions/artwork-mutations';

// Matches the server's deduplication window; also absorbs effects that run twice in development
const RECORD_INTERVAL_MS = 30 * 60 * 1000;
const lastRecordedAt = new Map<string, number>();

/** Count one public view of a notice when its page mounts, at most once per 30 minutes. */
export function useRecordNoticeView(artworkId: string) {
  useEffect(() => {
    const now = Date.now();
    if (now - (lastRecordedAt.get(artworkId) ?? 0) < RECORD_INTERVAL_MS) return;
    lastRecordedAt.set(artworkId, now);
    recordNoticeView({ data: artworkId }).catch(error =>
      console.error('Recording notice view failed:', error),
    );
  }, [artworkId]);
}
