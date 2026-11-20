import '@tanstack/react-start/server-only';
import type { Prisma } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma';
import {
  previousUtcDay,
  previousUtcWeek,
  summarizeNotices,
  summarizeSite,
  utcDaysAgo,
} from '../lib/aggregate';

/** Raw events are deleted after this many days; the daily and weekly summaries stay. */
export const EVENT_RETENTION_DAYS = 90;
/** Server-side view rows only serve view-count deduplication. */
const PAGE_VIEW_RETENTION_DAYS = 1;

const loadEvents = (start: Date, end: Date) =>
  prisma.analyticsEvent.findMany({
    where: { timestamp: { gte: start, lt: end } },
    select: {
      eventType: true,
      visitorId: true,
      sessionId: true,
      noticeId: true,
      pageCategory: true,
      deviceType: true,
      browser: true,
      referrer: true,
      durationMs: true,
    },
  });

/**
 * Summarise yesterday's events (UTC) into the daily tables, then delete expired raw rows.
 * Safe to re-run: summaries are upserted.
 */
export async function runNightlyAggregation(now = new Date()) {
  const { start: day, end } = previousUtcDay(now);
  const events = await loadEvents(day, end);
  const notices = summarizeNotices(events);
  const { topReferrers, browserStats, ...site } = summarizeSite(events);

  for (const { noticeId, ...stats } of notices) {
    await prisma.noticeDailySummary.upsert({
      where: { noticeId_day: { noticeId, day } },
      update: stats,
      create: { noticeId, day, ...stats },
    });
  }

  const siteData = {
    ...site,
    topReferrers: topReferrers satisfies Prisma.InputJsonValue,
    browserStats: browserStats satisfies Prisma.InputJsonValue,
  };
  await prisma.siteDailySummary.upsert({
    where: { day },
    update: siteData,
    create: { day, ...siteData },
  });

  const [deletedEvents, deletedPageViews] = await Promise.all([
    prisma.analyticsEvent.deleteMany({
      where: { timestamp: { lt: utcDaysAgo(now, EVENT_RETENTION_DAYS) } },
    }),
    prisma.pageView.deleteMany({
      where: { createdAt: { lt: utcDaysAgo(now, PAGE_VIEW_RETENTION_DAYS) } },
    }),
  ]);

  return {
    day: day.toISOString(),
    aggregatedNotices: notices.length,
    deletedEvents: deletedEvents.count,
    deletedPageViews: deletedPageViews.count,
  };
}

/** Summarise last week's events (UTC, Monday to Sunday) into the weekly tables. */
export async function runWeeklyAggregation(now = new Date()) {
  const { start: weekStart, end } = previousUtcWeek(now);
  const events = await loadEvents(weekStart, end);
  const notices = summarizeNotices(events);
  // Weekly tables keep the counters only
  const { topReferrers: _referrers, browserStats: _browsers, ...site } = summarizeSite(events);

  for (const { noticeId, views, uniqueVisitors, avgDurationMs } of notices) {
    const stats = { views, uniqueVisitors, avgDurationMs };
    await prisma.noticeWeeklySummary.upsert({
      where: { noticeId_weekStart: { noticeId, weekStart } },
      update: stats,
      create: { noticeId, weekStart, ...stats },
    });
  }

  await prisma.siteWeeklySummary.upsert({
    where: { weekStart },
    update: site,
    create: { weekStart, ...site },
  });

  return { weekStart: weekStart.toISOString(), aggregatedNotices: notices.length };
}
