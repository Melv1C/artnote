// What ArtNote sends to Umami (ADR 0010): which page views, and the notice reading event.

/** The parts of the router's state a page view depends on. */
interface PageState {
  location: { pathname: string };
  /** The location once its page has loaded: behind `location` while a navigation is under way */
  resolvedLocation?: { pathname: string };
  matches: { staticData: { measured?: boolean } }[];
}

/**
 * The path to send a page view for, or undefined: while a navigation is under way, when the
 * matches can still be the previous page's, and on a page one of whose routes declares
 * `measured: false`.
 */
export function measuredPagePath({
  location,
  resolvedLocation,
  matches,
}: PageState): string | undefined {
  if (resolvedLocation?.pathname !== location.pathname) return undefined;
  if (matches.some(match => match.staticData.measured === false)) return undefined;
  return location.pathname;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** The reading-time brackets, shortest first: a reading falls in the first one it is shorter than. */
export const READING_TIME_BRACKETS = [
  { name: '<30s', belowMs: 30 * SECOND },
  { name: '30s–2min', belowMs: 2 * MINUTE },
  { name: '2–5min', belowMs: 5 * MINUTE },
  { name: '>5min', belowMs: Infinity },
] as const;

export type ReadingTimeBracket = (typeof READING_TIME_BRACKETS)[number]['name'];

export function readingTimeBracket(durationMs: number): ReadingTimeBracket {
  const bracket =
    READING_TIME_BRACKETS.find(({ belowMs }) => durationMs < belowMs) ??
    READING_TIME_BRACKETS[READING_TIME_BRACKETS.length - 1];
  return bracket.name;
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
