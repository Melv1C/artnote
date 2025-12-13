import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron User-Agent pattern
const VERCEL_CRON_USER_AGENT = 'vercel-cron';

/**
 * Verify that the request is from Vercel Cron or has valid secret
 */
function isAuthorizedRequest(request: NextRequest): boolean {
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret && cronSecret === env.CRON_SECRET) return true;
  const userAgent = request.headers.get('user-agent') ?? '';
  if (userAgent.includes(VERCEL_CRON_USER_AGENT)) return true;
  return false;
}

/**
 * Get the start of the week (Monday) for a given date in UTC
 */
function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

/**
 * Run weekly aggregation:
 * 1. Aggregate the previous week's events into NoticeWeeklySummary
 * 2. Aggregate the previous week's events into SiteWeeklySummary
 */
async function runWeeklyAggregation(): Promise<{
  aggregatedNotices: number;
  siteSummaryCreated: boolean;
}> {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

  // =========================================================================
  // STEP 1: Aggregate notice-level stats
  // =========================================================================

  const noticeViewEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventType: 'notice_view_start',
      noticeId: { not: null },
      timestamp: { gte: lastWeekStart, lt: thisWeekStart },
    },
    select: { noticeId: true, visitorId: true, sessionId: true },
  });

  const noticeDurationEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventType: 'notice_view_end',
      noticeId: { not: null },
      timestamp: { gte: lastWeekStart, lt: thisWeekStart },
      durationMs: { not: null },
    },
    select: { noticeId: true, durationMs: true },
  });

  const noticeStats = new Map<
    string,
    { views: number; uniqueVisitors: Set<string>; durations: number[] }
  >();

  for (const event of noticeViewEvents) {
    if (!event.noticeId) continue;
    let stats = noticeStats.get(event.noticeId);
    if (!stats) {
      stats = { views: 0, uniqueVisitors: new Set(), durations: [] };
      noticeStats.set(event.noticeId, stats);
    }
    stats.views++;
    const visitorKey = event.visitorId ?? (event.sessionId ? `nc-${event.sessionId}` : null);
    if (visitorKey) stats.uniqueVisitors.add(visitorKey);
  }

  for (const event of noticeDurationEvents) {
    if (!event.noticeId || event.durationMs === null) continue;
    const stats = noticeStats.get(event.noticeId);
    if (stats) stats.durations.push(event.durationMs);
  }

  let aggregatedNotices = 0;
  for (const [noticeId, stats] of noticeStats) {
    const avgDurationMs =
      stats.durations.length > 0
        ? Math.round(stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length)
        : null;

    await prisma.noticeWeeklySummary.upsert({
      where: { noticeId_weekStart: { noticeId, weekStart: lastWeekStart } },
      update: { views: stats.views, uniqueVisitors: stats.uniqueVisitors.size, avgDurationMs },
      create: {
        noticeId,
        weekStart: lastWeekStart,
        views: stats.views,
        uniqueVisitors: stats.uniqueVisitors.size,
        avgDurationMs,
      },
    });
    aggregatedNotices++;
  }

  // =========================================================================
  // STEP 2: Aggregate site-wide stats
  // =========================================================================

  const allEvents = await prisma.analyticsEvent.findMany({
    where: { timestamp: { gte: lastWeekStart, lt: thisWeekStart } },
    select: {
      eventType: true,
      visitorId: true,
      sessionId: true,
      pageCategory: true,
      deviceType: true,
      durationMs: true,
    },
  });

  const uniqueVisitors = new Set<string>();
  const uniqueSessions = new Set<string>();
  let totalPageViews = 0;
  let homeViews = 0;
  let noticeViews = 0;
  let aboutViews = 0;
  let dashboardViews = 0;
  let otherViews = 0;
  let cookieAccepts = 0;
  let cookieRejects = 0;
  const deviceCounts = {
    desktop: new Set<string>(),
    mobile: new Set<string>(),
    tablet: new Set<string>(),
  };
  const sessionDurations: number[] = [];

  for (const event of allEvents) {
    const visitorKey = event.visitorId ?? (event.sessionId ? `nc-${event.sessionId}` : null);
    if (visitorKey) uniqueVisitors.add(visitorKey);
    if (event.sessionId) uniqueSessions.add(event.sessionId);

    if (event.eventType === 'page_view_start') {
      totalPageViews++;
      switch (event.pageCategory) {
        case 'home':
          homeViews++;
          break;
        case 'notice':
          noticeViews++;
          break;
        case 'about':
          aboutViews++;
          break;
        case 'dashboard':
          dashboardViews++;
          break;
        default:
          otherViews++;
      }
    }

    if (event.eventType === 'notice_view_start') {
      totalPageViews++;
      noticeViews++;
    }

    if (event.eventType === 'cookie_accept') cookieAccepts++;
    if (event.eventType === 'cookie_reject') cookieRejects++;

    if (visitorKey && event.deviceType) {
      if (event.deviceType === 'mobile') deviceCounts.mobile.add(visitorKey);
      else if (event.deviceType === 'tablet') deviceCounts.tablet.add(visitorKey);
      else deviceCounts.desktop.add(visitorKey);
    }

    if (
      (event.eventType === 'page_view_end' || event.eventType === 'notice_view_end') &&
      event.durationMs
    ) {
      sessionDurations.push(event.durationMs);
    }
  }

  const avgSessionDurationMs =
    sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : null;

  await prisma.siteWeeklySummary.upsert({
    where: { weekStart: lastWeekStart },
    update: {
      totalPageViews,
      uniqueVisitors: uniqueVisitors.size,
      uniqueSessions: uniqueSessions.size,
      avgSessionDurationMs,
      homeViews,
      noticeViews,
      aboutViews,
      dashboardViews,
      otherViews,
      cookieAccepts,
      cookieRejects,
      desktopVisitors: deviceCounts.desktop.size,
      mobileVisitors: deviceCounts.mobile.size,
      tabletVisitors: deviceCounts.tablet.size,
    },
    create: {
      weekStart: lastWeekStart,
      totalPageViews,
      uniqueVisitors: uniqueVisitors.size,
      uniqueSessions: uniqueSessions.size,
      avgSessionDurationMs,
      homeViews,
      noticeViews,
      aboutViews,
      dashboardViews,
      otherViews,
      cookieAccepts,
      cookieRejects,
      desktopVisitors: deviceCounts.desktop.size,
      mobileVisitors: deviceCounts.mobile.size,
      tabletVisitors: deviceCounts.tablet.size,
    },
  });

  return { aggregatedNotices, siteSummaryCreated: true };
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    console.warn('Unauthorized cron request attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const result = await runWeeklyAggregation();
    const duration = Date.now() - startTime;

    console.log(
      `Weekly aggregation completed: ${result.aggregatedNotices} notices, site summary: ${result.siteSummaryCreated} (${duration}ms)`,
    );

    return NextResponse.json({
      ok: true,
      aggregatedNotices: result.aggregatedNotices,
      siteSummaryCreated: result.siteSummaryCreated,
      durationMs: duration,
    });
  } catch (error) {
    console.error('Weekly aggregation failed:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
