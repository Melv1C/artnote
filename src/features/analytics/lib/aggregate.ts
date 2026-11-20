import { PageCategorySchema, type AnalyticsEventType, type PageCategory } from './events';

/** The columns of `analytics_event` the aggregation reads. */
export type AggregatableEvent = {
  eventType: AnalyticsEventType | (string & {});
  visitorId: string | null;
  sessionId: string | null;
  noticeId: string | null;
  pageCategory: string | null;
  deviceType: string | null;
  browser: string | null;
  referrer: string | null;
  durationMs: number | null;
};

export type NoticeSummary = {
  noticeId: string;
  views: number;
  uniqueVisitors: number;
  avgDurationMs: number | null;
  medianDurationMs: number | null;
  topReferrer: string | null;
};

export type SiteSummary = {
  totalPageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
  avgSessionDurationMs: number | null;
  homeViews: number;
  noticeViews: number;
  aboutViews: number;
  dashboardViews: number;
  otherViews: number;
  cookieAccepts: number;
  cookieRejects: number;
  desktopVisitors: number;
  mobileVisitors: number;
  tabletVisitors: number;
  topReferrers: { referrer: string; count: number }[];
  browserStats: Record<string, number>;
};

const TOP_REFERRERS = 10;

/**
 * A visitor's identity: the consented visitor cookie, else the in-memory session
 * (prefixed so a session id never collides with a visitor id).
 */
const visitorKey = (event: AggregatableEvent) =>
  event.visitorId ?? (event.sessionId ? `nc-${event.sessionId}` : null);

const average = (values: number[]) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

const median = (values: number[]) => {
  if (!values.length) return null;
  const sorted = values.toSorted((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? null;
};

const increment = (counts: Map<string, number>, key: string) =>
  counts.set(key, (counts.get(key) ?? 0) + 1);

/** The key with the highest count; the first one seen wins ties. */
const mostFrequent = (counts: Map<string, number>) => {
  let top: string | null = null;
  let topCount = 0;
  for (const [key, count] of counts) {
    if (count > topCount) [top, topCount] = [key, count];
  }
  return top;
};

/** Per-notice stats from `notice_view_start` (views) and `notice_view_end` (durations). */
export function summarizeNotices(events: AggregatableEvent[]): NoticeSummary[] {
  const byNotice = new Map<
    string,
    { views: number; visitors: Set<string>; durations: number[]; referrers: Map<string, number> }
  >();
  const statsFor = (noticeId: string) => {
    let stats = byNotice.get(noticeId);
    if (!stats) {
      stats = { views: 0, visitors: new Set(), durations: [], referrers: new Map() };
      byNotice.set(noticeId, stats);
    }
    return stats;
  };

  for (const event of events) {
    if (!event.noticeId) continue;
    if (event.eventType === 'notice_view_start') {
      const stats = statsFor(event.noticeId);
      stats.views++;
      const visitor = visitorKey(event);
      if (visitor) stats.visitors.add(visitor);
      if (event.referrer) increment(stats.referrers, event.referrer);
    }
  }
  // Durations only count for notices that were viewed in the same period
  for (const event of events) {
    if (event.eventType === 'notice_view_end' && event.noticeId && event.durationMs !== null) {
      byNotice.get(event.noticeId)?.durations.push(event.durationMs);
    }
  }

  return [...byNotice].map(([noticeId, stats]) => ({
    noticeId,
    views: stats.views,
    uniqueVisitors: stats.visitors.size,
    avgDurationMs: average(stats.durations),
    medianDurationMs: median(stats.durations),
    topReferrer: mostFrequent(stats.referrers),
  }));
}

const PAGE_VIEW_COLUMNS = {
  home: 'homeViews',
  notice: 'noticeViews',
  about: 'aboutViews',
  dashboard: 'dashboardViews',
  other: 'otherViews',
} as const satisfies Record<PageCategory, string>;

/**
 * Site-wide stats. Page views come from `page_view_start` only: every route, notice pages
 * included, sends one, so `notice_view_start` is not counted again here.
 */
export function summarizeSite(events: AggregatableEvent[]): SiteSummary {
  const visitors = new Set<string>();
  const sessions = new Set<string>();
  const devices = {
    desktop: new Set<string>(),
    mobile: new Set<string>(),
    tablet: new Set<string>(),
  };
  const browsers = new Map<string, number>();
  const referrers = new Map<string, number>();
  const durations: number[] = [];
  const summary = {
    totalPageViews: 0,
    homeViews: 0,
    noticeViews: 0,
    aboutViews: 0,
    dashboardViews: 0,
    otherViews: 0,
    cookieAccepts: 0,
    cookieRejects: 0,
  };

  for (const event of events) {
    const visitor = visitorKey(event);
    if (visitor) visitors.add(visitor);
    if (event.sessionId) sessions.add(event.sessionId);

    if (visitor && event.deviceType) {
      const device =
        event.deviceType === 'mobile' || event.deviceType === 'tablet'
          ? event.deviceType
          : 'desktop';
      devices[device].add(visitor);
    }
    if (event.browser) increment(browsers, event.browser);

    switch (event.eventType) {
      case 'page_view_start': {
        summary.totalPageViews++;
        const category = PageCategorySchema.catch('other').parse(event.pageCategory);
        summary[PAGE_VIEW_COLUMNS[category]]++;
        if (event.referrer) increment(referrers, event.referrer);
        break;
      }
      case 'page_view_end':
        if (event.durationMs) durations.push(event.durationMs);
        break;
      case 'cookie_accept':
        summary.cookieAccepts++;
        break;
      case 'cookie_reject':
        summary.cookieRejects++;
        break;
    }
  }

  return {
    ...summary,
    uniqueVisitors: visitors.size,
    uniqueSessions: sessions.size,
    avgSessionDurationMs: average(durations),
    desktopVisitors: devices.desktop.size,
    mobileVisitors: devices.mobile.size,
    tabletVisitors: devices.tablet.size,
    topReferrers: [...referrers]
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, TOP_REFERRERS)
      .map(([referrer, count]) => ({ referrer, count })),
    browserStats: Object.fromEntries(browsers),
  };
}

/** `[start, end)` of the UTC day before `now`. */
export function previousUtcDay(now: Date) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 1);
  return { start, end };
}

/** `[start, end)` of the UTC Monday-to-Sunday week before the one containing `now`. */
export function previousUtcWeek(now: Date) {
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const daysSinceMonday = (end.getUTCDay() + 6) % 7;
  end.setUTCDate(end.getUTCDate() - daysSinceMonday);
  const start = new Date(end);
  start.setUTCDate(end.getUTCDate() - 7);
  return { start, end };
}

/** Midnight UTC `days` days before `now`'s UTC day. */
export function utcDaysAgo(now: Date, days: number) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - days));
}
