import { Prisma } from '@/generated/prisma/client';
import { env } from '@/lib/env';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron User-Agent pattern
const VERCEL_CRON_USER_AGENT = 'vercel-cron';

/**
 * Verify that the request is from Vercel Cron or has valid secret
 */
function isAuthorizedRequest(request: NextRequest): boolean {
  // Check for CRON_SECRET header
  const cronSecret = request.headers.get('x-cron-secret');
  if (cronSecret && cronSecret === env.CRON_SECRET) {
    return true;
  }

  // Check for Vercel Cron User-Agent (additional layer)
  const userAgent = request.headers.get('user-agent') ?? '';
  if (userAgent.includes(VERCEL_CRON_USER_AGENT)) {
    return true;
  }

  return false;
}

/**
 * Run nightly aggregation:
 * 1. Aggregate yesterday's events into NoticeDailySummary
 * 2. Aggregate yesterday's events into SiteDailySummary
 * 3. Delete events older than 90 days
 */
async function runNightlyAggregation(): Promise<{
  aggregatedNotices: number;
  siteSummaryCreated: boolean;
  deletedEvents: number;
}> {
  // Calculate date ranges (UTC)
  const now = new Date();
  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const retentionThreshold = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 90),
  );

  // =========================================================================
  // STEP 1: Aggregate notice-level stats
  // =========================================================================

  const noticeViewEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventType: 'notice_view_start',
      noticeId: { not: null },
      timestamp: { gte: yesterday, lt: today },
    },
    select: { noticeId: true, visitorId: true, sessionId: true, referrer: true },
  });

  const noticeDurationEvents = await prisma.analyticsEvent.findMany({
    where: {
      eventType: 'notice_view_end',
      noticeId: { not: null },
      timestamp: { gte: yesterday, lt: today },
      durationMs: { not: null },
    },
    select: { noticeId: true, durationMs: true },
  });

  // Group by noticeId
  const noticeStats = new Map<
    string,
    {
      views: number;
      uniqueVisitors: Set<string>;
      durations: number[];
      referrers: Map<string, number>;
    }
  >();

  for (const event of noticeViewEvents) {
    if (!event.noticeId) continue;
    let stats = noticeStats.get(event.noticeId);
    if (!stats) {
      stats = { views: 0, uniqueVisitors: new Set(), durations: [], referrers: new Map() };
      noticeStats.set(event.noticeId, stats);
    }
    stats.views++;
    const visitorKey = event.visitorId ?? (event.sessionId ? `nc-${event.sessionId}` : null);
    if (visitorKey) stats.uniqueVisitors.add(visitorKey);
    if (event.referrer) {
      stats.referrers.set(event.referrer, (stats.referrers.get(event.referrer) ?? 0) + 1);
    }
  }

  for (const event of noticeDurationEvents) {
    if (!event.noticeId || event.durationMs === null) continue;
    const stats = noticeStats.get(event.noticeId);
    if (stats) stats.durations.push(event.durationMs);
  }

  let aggregatedNotices = 0;
  for (const [noticeId, stats] of noticeStats) {
    const sortedDurations = stats.durations.sort((a, b) => a - b);
    const medianDurationMs =
      sortedDurations.length > 0 ? sortedDurations[Math.floor(sortedDurations.length / 2)] : null;
    const avgDurationMs =
      sortedDurations.length > 0
        ? Math.round(sortedDurations.reduce((a, b) => a + b, 0) / sortedDurations.length)
        : null;

    let topReferrer: string | null = null;
    let maxCount = 0;
    for (const [ref, count] of stats.referrers) {
      if (count > maxCount) {
        maxCount = count;
        topReferrer = ref;
      }
    }

    await prisma.noticeDailySummary.upsert({
      where: { noticeId_day: { noticeId, day: yesterday } },
      update: {
        views: stats.views,
        uniqueVisitors: stats.uniqueVisitors.size,
        medianDurationMs,
        avgDurationMs,
        topReferrer,
      },
      create: {
        noticeId,
        day: yesterday,
        views: stats.views,
        uniqueVisitors: stats.uniqueVisitors.size,
        medianDurationMs,
        avgDurationMs,
        topReferrer,
      },
    });
    aggregatedNotices++;
  }

  // =========================================================================
  // STEP 2: Aggregate site-wide stats
  // =========================================================================

  const allEvents = await prisma.analyticsEvent.findMany({
    where: { timestamp: { gte: yesterday, lt: today } },
    select: {
      eventType: true,
      visitorId: true,
      sessionId: true,
      pageCategory: true,
      deviceType: true,
      browser: true,
      referrer: true,
      durationMs: true,
    },
  });

  // Site-wide aggregation
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
  const browserCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const sessionDurations: number[] = [];

  for (const event of allEvents) {
    const visitorKey = event.visitorId ?? (event.sessionId ? `nc-${event.sessionId}` : null);
    if (visitorKey) uniqueVisitors.add(visitorKey);
    if (event.sessionId) uniqueSessions.add(event.sessionId);

    // Count page views (both page_view_start and notice_view_start)
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

    // Also count notice views in the notice category
    if (event.eventType === 'notice_view_start') {
      totalPageViews++;
      noticeViews++;
    }

    // Cookie consent funnel
    if (event.eventType === 'cookie_accept') cookieAccepts++;
    if (event.eventType === 'cookie_reject') cookieRejects++;

    // Device breakdown (per unique visitor)
    if (visitorKey && event.deviceType) {
      if (event.deviceType === 'mobile') deviceCounts.mobile.add(visitorKey);
      else if (event.deviceType === 'tablet') deviceCounts.tablet.add(visitorKey);
      else deviceCounts.desktop.add(visitorKey);
    }

    // Browser stats
    if (event.browser) {
      browserCounts.set(event.browser, (browserCounts.get(event.browser) ?? 0) + 1);
    }

    // Referrer stats
    if (
      event.referrer &&
      (event.eventType === 'page_view_start' || event.eventType === 'notice_view_start')
    ) {
      referrerCounts.set(event.referrer, (referrerCounts.get(event.referrer) ?? 0) + 1);
    }

    // Session durations (from page_view_end events)
    if (
      (event.eventType === 'page_view_end' || event.eventType === 'notice_view_end') &&
      event.durationMs
    ) {
      sessionDurations.push(event.durationMs);
    }
  }

  // Calculate average session duration
  const avgSessionDurationMs =
    sessionDurations.length > 0
      ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
      : null;

  // Top referrers (top 10)
  const topReferrers = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }));

  // Browser stats object
  const browserStats = Object.fromEntries(browserCounts);

  await prisma.siteDailySummary.upsert({
    where: { day: yesterday },
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
      topReferrers: topReferrers as unknown as Prisma.InputJsonValue,
      browserStats: browserStats as unknown as Prisma.InputJsonValue,
    },
    create: {
      day: yesterday,
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
      topReferrers: topReferrers as unknown as Prisma.InputJsonValue,
      browserStats: browserStats as unknown as Prisma.InputJsonValue,
    },
  });

  // =========================================================================
  // STEP 3: Delete events older than 90 days
  // =========================================================================

  const deleteResult = await prisma.analyticsEvent.deleteMany({
    where: { timestamp: { lt: retentionThreshold } },
  });

  return {
    aggregatedNotices,
    siteSummaryCreated: true,
    deletedEvents: deleteResult.count,
  };
}

export async function GET(request: NextRequest) {
  // Verify authorization
  if (!isAuthorizedRequest(request)) {
    console.warn('Unauthorized cron request attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const result = await runNightlyAggregation();
    const duration = Date.now() - startTime;

    console.log(
      `Nightly aggregation completed: ${result.aggregatedNotices} notices, site summary: ${result.siteSummaryCreated}, ${result.deletedEvents} old events deleted (${duration}ms)`,
    );

    return NextResponse.json({
      ok: true,
      aggregatedNotices: result.aggregatedNotices,
      siteSummaryCreated: result.siteSummaryCreated,
      deletedEvents: result.deletedEvents,
      durationMs: duration,
    });
  } catch (error) {
    console.error('Nightly aggregation failed:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
