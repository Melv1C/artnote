import { describe, expect, it } from 'vite-plus/test';
import {
  previousUtcDay,
  previousUtcWeek,
  summarizeNotices,
  summarizeSite,
  type AggregatableEvent,
} from './aggregate';

const event = (overrides: Partial<AggregatableEvent>): AggregatableEvent => ({
  eventType: 'page_view_start',
  visitorId: null,
  sessionId: 's1',
  noticeId: null,
  pageCategory: null,
  deviceType: 'desktop',
  browser: 'Firefox',
  referrer: null,
  durationMs: null,
  ...overrides,
});

// One visit to a notice page sends both a page view and a notice view
const noticeVisit = (noticeId: string, sessionId: string, durationMs: number) => [
  event({ eventType: 'page_view_start', pageCategory: 'notice', sessionId }),
  event({ eventType: 'notice_view_start', noticeId, sessionId }),
  event({ eventType: 'notice_view_end', noticeId, sessionId, durationMs }),
  event({ eventType: 'page_view_end', pageCategory: 'notice', sessionId, durationMs }),
];

describe('summarizeSite', () => {
  it('counts a notice page once, not once per tracker', () => {
    const site = summarizeSite(noticeVisit('n1', 's1', 5000));
    expect(site.totalPageViews).toBe(1);
    expect(site.noticeViews).toBe(1);
  });

  it('breaks page views down by category, unknown ones as other', () => {
    const site = summarizeSite([
      event({ pageCategory: 'home' }),
      event({ pageCategory: 'home' }),
      event({ pageCategory: 'about' }),
      event({ pageCategory: 'nonsense' }),
      event({ pageCategory: null }),
    ]);
    expect(site).toMatchObject({ totalPageViews: 5, homeViews: 2, aboutViews: 1, otherViews: 2 });
  });

  it('counts visitors by cookie id, else by session', () => {
    const site = summarizeSite([
      event({ visitorId: 'v1', sessionId: 'a' }),
      event({ visitorId: 'v1', sessionId: 'b' }),
      event({ sessionId: 'c', deviceType: 'mobile' }),
    ]);
    expect(site.uniqueVisitors).toBe(2);
    expect(site.uniqueSessions).toBe(3);
    expect(site.desktopVisitors).toBe(1);
    expect(site.mobileVisitors).toBe(1);
  });

  it('averages page durations and tallies consent, referrers and browsers', () => {
    const site = summarizeSite([
      event({ eventType: 'page_view_end', durationMs: 1000 }),
      event({ eventType: 'page_view_end', durationMs: 3000 }),
      event({ eventType: 'cookie_accept' }),
      event({ eventType: 'cookie_reject' }),
      event({ eventType: 'cookie_reject' }),
      event({ referrer: 'google.com' }),
      event({ referrer: 'google.com', browser: 'Chrome' }),
    ]);
    expect(site.avgSessionDurationMs).toBe(2000);
    expect(site.cookieAccepts).toBe(1);
    expect(site.cookieRejects).toBe(2);
    expect(site.topReferrers).toEqual([{ referrer: 'google.com', count: 2 }]);
    expect(site.browserStats).toEqual({ Firefox: 6, Chrome: 1 });
  });
});

describe('summarizeNotices', () => {
  it('counts views, unique visitors and durations per notice', () => {
    const [summary, ...rest] = summarizeNotices([
      ...noticeVisit('n1', 's1', 1000),
      ...noticeVisit('n1', 's1', 2000),
      ...noticeVisit('n1', 's2', 9000),
    ]);
    expect(rest).toHaveLength(0);
    expect(summary).toEqual({
      noticeId: 'n1',
      views: 3,
      uniqueVisitors: 2,
      avgDurationMs: 4000,
      medianDurationMs: 2000,
      topReferrer: null,
    });
  });

  it('ignores durations of notices not viewed in the period', () => {
    expect(
      summarizeNotices([event({ eventType: 'notice_view_end', noticeId: 'n1', durationMs: 10 })]),
    ).toEqual([]);
  });
});

describe('periods', () => {
  it('previousUtcDay is yesterday, midnight to midnight UTC', () => {
    const { start, end } = previousUtcDay(new Date('2026-11-20T01:30:00Z'));
    expect(start.toISOString()).toBe('2026-11-19T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-20T00:00:00.000Z');
  });

  it('previousUtcWeek is last Monday to this Monday', () => {
    // 2026-11-22 is a Sunday
    const { start, end } = previousUtcWeek(new Date('2026-11-22T03:00:00Z'));
    expect(start.toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(end.toISOString()).toBe('2026-11-16T00:00:00.000Z');
  });
});
