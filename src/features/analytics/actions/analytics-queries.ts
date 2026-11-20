import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas/common';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { utcDaysAgo } from '../lib/aggregate';

/** Dashboard reports cover this many days of daily summaries. */
export const REPORT_DAYS = 30;

const chartColor = (index: number) => `var(--chart-${(index % 5) + 1})`;

const siteSummariesSince = (days: number) =>
  prisma.siteDailySummary.findMany({
    where: { day: { gte: utcDaysAgo(new Date(), days) } },
    orderBy: { day: 'asc' },
  });

const sum = <T>(rows: T[], value: (row: T) => number) =>
  rows.reduce((total, row) => total + value(row), 0);

/** Totals over the report period plus live counts from raw events. */
export const fetchAnalyticsOverview = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const now = Date.now();
    const pageViewsSince = (ms: number) =>
      prisma.analyticsEvent.count({
        where: { eventType: 'page_view_start', timestamp: { gte: new Date(now - ms) } },
      });

    const [days, last24hViews, last1hViews, totalNotices] = await Promise.all([
      siteSummariesSince(REPORT_DAYS),
      pageViewsSince(24 * 60 * 60 * 1000),
      pageViewsSince(60 * 60 * 1000),
      prisma.artwork.count({ where: { status: ArtworkStatusSchema.enum.PUBLISHED } }),
    ]);

    const cookieAccepts = sum(days, day => day.cookieAccepts);
    const cookieResponses = cookieAccepts + sum(days, day => day.cookieRejects);
    const durations = days.flatMap(day => day.avgSessionDurationMs ?? []);

    return {
      summary: {
        totalPageViews: sum(days, day => day.totalPageViews),
        uniqueVisitors: sum(days, day => day.uniqueVisitors),
        avgSessionDurationMs: durations.length
          ? Math.round(sum(durations, duration => duration) / durations.length)
          : null,
        cookieAcceptRate: cookieResponses ? (cookieAccepts / cookieResponses) * 100 : 0,
        homeViews: sum(days, day => day.homeViews),
        noticeViews: sum(days, day => day.noticeViews),
        aboutViews: sum(days, day => day.aboutViews),
      },
      realtimeStats: { last24hViews, last1hViews, totalNotices },
    };
  });

export const fetchDailyTrends = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () =>
    (await siteSummariesSince(REPORT_DAYS)).map(day => ({
      day: day.day.toISOString().slice(0, 10),
      pageViews: day.totalPageViews,
      uniqueVisitors: day.uniqueVisitors,
      uniqueSessions: day.uniqueSessions,
    })),
  );

export const fetchDeviceBreakdown = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const days = await siteSummariesSince(REPORT_DAYS);
    return [
      { device: 'Desktop', visitors: sum(days, day => day.desktopVisitors) },
      { device: 'Mobile', visitors: sum(days, day => day.mobileVisitors) },
      { device: 'Tablet', visitors: sum(days, day => day.tabletVisitors) },
    ]
      .map((row, index) => ({ ...row, fill: chartColor(index) }))
      .filter(row => row.visitors > 0);
  });

export const fetchPageCategoryBreakdown = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const days = await siteSummariesSince(REPORT_DAYS);
    return [
      { category: 'Accueil', views: sum(days, day => day.homeViews) },
      { category: 'Notices', views: sum(days, day => day.noticeViews) },
      { category: 'À propos', views: sum(days, day => day.aboutViews) },
      { category: 'Dashboard', views: sum(days, day => day.dashboardViews) },
      { category: 'Autres', views: sum(days, day => day.otherViews) },
    ]
      .map((row, index) => ({ ...row, fill: chartColor(index) }))
      .filter(row => row.views > 0);
  });

const BrowserStatsSchema = z.record(z.string(), z.number()).catch({});

export const fetchBrowserStats = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const totals = new Map<string, number>();
    for (const day of await siteSummariesSince(REPORT_DAYS)) {
      for (const [browser, count] of Object.entries(BrowserStatsSchema.parse(day.browserStats))) {
        totals.set(browser, (totals.get(browser) ?? 0) + count);
      }
    }
    return [...totals]
      .toSorted((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([browser, count], index) => ({ browser, count, fill: chartColor(index) }));
  });

const TOP_NOTICES = 10;

export const fetchTopNotices = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const rows = await prisma.noticeDailySummary.groupBy({
      by: ['noticeId'],
      where: { day: { gte: utcDaysAgo(new Date(), REPORT_DAYS) } },
      _sum: { views: true, uniqueVisitors: true },
      _avg: { avgDurationMs: true },
      orderBy: { _sum: { views: 'desc' } },
      take: TOP_NOTICES,
    });
    const artworks = await prisma.artwork.findMany({
      where: { id: { in: rows.map(row => row.noticeId) } },
      select: { id: true, title: true },
    });
    const titles = new Map(artworks.map(artwork => [artwork.id, artwork.title]));

    return rows.map(row => ({
      id: row.noticeId,
      title: titles.get(row.noticeId) ?? 'Notice supprimée',
      views: row._sum.views ?? 0,
      uniqueVisitors: row._sum.uniqueVisitors ?? 0,
      avgDurationMs: row._avg.avgDurationMs ?? null,
    }));
  });

export type AnalyticsOverview = Awaited<ReturnType<typeof fetchAnalyticsOverview>>;
export type DailyTrend = Awaited<ReturnType<typeof fetchDailyTrends>>[number];
export type DeviceBreakdownRow = Awaited<ReturnType<typeof fetchDeviceBreakdown>>[number];
export type PageCategoryRow = Awaited<ReturnType<typeof fetchPageCategoryBreakdown>>[number];
export type BrowserRow = Awaited<ReturnType<typeof fetchBrowserStats>>[number];
export type TopNotice = Awaited<ReturnType<typeof fetchTopNotices>>[number];
