import { useEffect } from 'react';
import { recordNoticeView } from '../actions/artwork-mutations';

// Notices already counted during this page load (effects can run twice in development)
const recorded = new Set<string>();

/** Count one public view of a notice when its page mounts. */
export function useRecordNoticeView(artworkId: string) {
  useEffect(() => {
    if (recorded.has(artworkId)) return;
    recorded.add(artworkId);
    recordNoticeView({ data: artworkId }).catch(error =>
      console.error('Recording notice view failed:', error),
    );
  }, [artworkId]);
}
