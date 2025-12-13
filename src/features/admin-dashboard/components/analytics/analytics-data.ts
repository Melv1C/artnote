import { prisma } from '@/lib/prisma';

export type DailyTrendData = {
  day: string;
  pageViews: number;
  uniqueVisitors: number;
  uniqueSessions: number;
};

export type DeviceBreakdown = {
  device: string;
  visitors: number;
  fill: string;
};

export type PageCategoryData = {
  category: string;
  views: number;
  fill: string;
};

export type TopNoticeData = {
  id: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgDurationMs: number | null;
};

export type AnalyticsSummary = {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDurationMs: number | null;
  cookieAcceptRate: number;
  homeViews: number;
  noticeViews: number;
  aboutViews: number;
};

export type BrowserData = {
  browser: string;
  count: number;
  fill: string;
};

const PAGE_COLORS = {
  home: 'hsl(var(--chart-1))',
  notice: 'hsl(var(--chart-2))',
  about: 'hsl(var(--chart-3))',
  dashboard: 'hsl(var(--chart-4))',
  other: 'hsl(var(--chart-5))',
};

const DEVICE_COLORS = {
  desktop: 'hsl(var(--chart-1))',
  mobile: 'hsl(var(--chart-2))',
  tablet: 'hsl(var(--chart-3))',
};

const BROWSER_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export async function getDailyTrends(days: number = 30): Promise<DailyTrendData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.siteDailySummary.findMany({
    where: {
      day: { gte: startDate },
    },
    orderBy: { day: 'asc' },
  });

  return summaries.map(s => ({
    day: s.day.toISOString().split('T')[0],
    pageViews: s.totalPageViews,
    uniqueVisitors: s.uniqueVisitors,
    uniqueSessions: s.uniqueSessions,
  }));
}

export async function getDeviceBreakdown(days: number = 30): Promise<DeviceBreakdown[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.siteDailySummary.findMany({
    where: {
      day: { gte: startDate },
    },
  });

  const totals = summaries.reduce(
    (acc, s) => ({
      desktop: acc.desktop + s.desktopVisitors,
      mobile: acc.mobile + s.mobileVisitors,
      tablet: acc.tablet + s.tabletVisitors,
    }),
    { desktop: 0, mobile: 0, tablet: 0 },
  );

  return [
    { device: 'Desktop', visitors: totals.desktop, fill: DEVICE_COLORS.desktop },
    { device: 'Mobile', visitors: totals.mobile, fill: DEVICE_COLORS.mobile },
    { device: 'Tablet', visitors: totals.tablet, fill: DEVICE_COLORS.tablet },
  ].filter(d => d.visitors > 0);
}

export async function getPageCategoryBreakdown(days: number = 30): Promise<PageCategoryData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.siteDailySummary.findMany({
    where: {
      day: { gte: startDate },
    },
  });

  const totals = summaries.reduce(
    (acc, s) => ({
      home: acc.home + s.homeViews,
      notice: acc.notice + s.noticeViews,
      about: acc.about + s.aboutViews,
      dashboard: acc.dashboard + s.dashboardViews,
      other: acc.other + s.otherViews,
    }),
    { home: 0, notice: 0, about: 0, dashboard: 0, other: 0 },
  );

  return [
    { category: 'Accueil', views: totals.home, fill: PAGE_COLORS.home },
    { category: 'Notices', views: totals.notice, fill: PAGE_COLORS.notice },
    { category: 'À propos', views: totals.about, fill: PAGE_COLORS.about },
    { category: 'Dashboard', views: totals.dashboard, fill: PAGE_COLORS.dashboard },
    { category: 'Autres', views: totals.other, fill: PAGE_COLORS.other },
  ].filter(p => p.views > 0);
}

export async function getTopNotices(
  limit: number = 10,
  days: number = 30,
): Promise<TopNoticeData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.noticeDailySummary.groupBy({
    by: ['noticeId'],
    where: {
      day: { gte: startDate },
    },
    _sum: {
      views: true,
      uniqueVisitors: true,
    },
    _avg: {
      avgDurationMs: true,
    },
    orderBy: {
      _sum: {
        views: 'desc',
      },
    },
    take: limit,
  });

  const noticeIds = summaries.map(s => s.noticeId);
  const artworks = await prisma.artwork.findMany({
    where: { id: { in: noticeIds } },
    select: { id: true, title: true },
  });

  const artworkMap = new Map(artworks.map(a => [a.id, a.title]));

  return summaries.map(s => ({
    id: s.noticeId,
    title: artworkMap.get(s.noticeId) ?? 'Notice supprimée',
    views: s._sum.views ?? 0,
    uniqueVisitors: s._sum.uniqueVisitors ?? 0,
    avgDurationMs: s._avg.avgDurationMs ?? null,
  }));
}

export async function getAnalyticsSummary(days: number = 30): Promise<AnalyticsSummary> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.siteDailySummary.findMany({
    where: {
      day: { gte: startDate },
    },
  });

  if (summaries.length === 0) {
    return {
      totalPageViews: 0,
      uniqueVisitors: 0,
      avgSessionDurationMs: null,
      cookieAcceptRate: 0,
      homeViews: 0,
      noticeViews: 0,
      aboutViews: 0,
    };
  }

  const totals = summaries.reduce(
    (acc, s) => ({
      totalPageViews: acc.totalPageViews + s.totalPageViews,
      uniqueVisitors: acc.uniqueVisitors + s.uniqueVisitors,
      cookieAccepts: acc.cookieAccepts + s.cookieAccepts,
      cookieRejects: acc.cookieRejects + s.cookieRejects,
      homeViews: acc.homeViews + s.homeViews,
      noticeViews: acc.noticeViews + s.noticeViews,
      aboutViews: acc.aboutViews + s.aboutViews,
      totalDuration: acc.totalDuration + (s.avgSessionDurationMs ?? 0),
      durationCount: acc.durationCount + (s.avgSessionDurationMs ? 1 : 0),
    }),
    {
      totalPageViews: 0,
      uniqueVisitors: 0,
      cookieAccepts: 0,
      cookieRejects: 0,
      homeViews: 0,
      noticeViews: 0,
      aboutViews: 0,
      totalDuration: 0,
      durationCount: 0,
    },
  );

  const totalCookieResponses = totals.cookieAccepts + totals.cookieRejects;
  const cookieAcceptRate =
    totalCookieResponses > 0 ? (totals.cookieAccepts / totalCookieResponses) * 100 : 0;

  return {
    totalPageViews: totals.totalPageViews,
    uniqueVisitors: totals.uniqueVisitors,
    avgSessionDurationMs:
      totals.durationCount > 0 ? Math.round(totals.totalDuration / totals.durationCount) : null,
    cookieAcceptRate,
    homeViews: totals.homeViews,
    noticeViews: totals.noticeViews,
    aboutViews: totals.aboutViews,
  };
}

export async function getBrowserStats(days: number = 30): Promise<BrowserData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const summaries = await prisma.siteDailySummary.findMany({
    where: {
      day: { gte: startDate },
    },
    select: { browserStats: true },
  });

  const browserTotals: Record<string, number> = {};

  for (const s of summaries) {
    if (s.browserStats && typeof s.browserStats === 'object') {
      const stats = s.browserStats as Record<string, number>;
      for (const [browser, count] of Object.entries(stats)) {
        browserTotals[browser] = (browserTotals[browser] ?? 0) + count;
      }
    }
  }

  return Object.entries(browserTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([browser, count], index) => ({
      browser,
      count,
      fill: BROWSER_COLORS[index] ?? 'hsl(var(--chart-1))',
    }));
}

export async function getRealtimeStats() {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last1h = new Date(now.getTime() - 60 * 60 * 1000);

  const [last24hViews, last1hViews, totalNotices] = await Promise.all([
    prisma.analyticsEvent.count({
      where: {
        eventType: 'page_view_start',
        timestamp: { gte: last24h },
      },
    }),
    prisma.analyticsEvent.count({
      where: {
        eventType: 'page_view_start',
        timestamp: { gte: last1h },
      },
    }),
    prisma.artwork.count({
      where: { status: 'PUBLISHED' },
    }),
  ]);

  return {
    last24hViews,
    last1hViews,
    totalNotices,
  };
}
