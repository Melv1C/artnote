// What ArtNote sends to Umami (ADR 0010): which pages are measured, and the notice reading event.

/**
 * True when a page view of `path` is measured: every public page, but not the dashboard nor a
 * notice preview, which are admin work rather than readers.
 */
export function isMeasuredPath(path: string): boolean {
  const normalized = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (normalized === '/dashboard' || normalized.startsWith('/dashboard/')) return false;
  // Notice URLs come from src/routes/artworks/$artworkId/ (index and preview); update both together
  if (normalized.startsWith('/artworks/') && normalized.endsWith('/preview')) return false;
  return true;
}

export type ReadingTimeBracket = '<30s' | '30s–2min' | '2–5min' | '>5min';

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** The reading-time bracket a notice reading of `durationMs` falls in. */
export function readingTimeBracket(durationMs: number): ReadingTimeBracket {
  if (durationMs < 30 * SECOND) return '<30s';
  if (durationMs < 2 * MINUTE) return '30s–2min';
  if (durationMs < 5 * MINUTE) return '2–5min';
  return '>5min';
}

const NOTICE_READ_EVENT = 'notice_read';

/** Umami keeps event values short; longer titles are cut. */
const MAX_TITLE_LENGTH = 100;

/** The `notice_read` event data: the notice, its title for readable reports, and the bracket. */
export function noticeReadingEvent({
  noticeId,
  title,
  durationMs,
}: {
  noticeId: string;
  title: string;
  durationMs: number;
}) {
  return {
    name: NOTICE_READ_EVENT,
    data: {
      noticeId,
      title: title.slice(0, MAX_TITLE_LENGTH),
      bracket: readingTimeBracket(durationMs),
    },
  };
}
