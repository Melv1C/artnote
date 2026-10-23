import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas';
import { createServerFn } from '@tanstack/react-start';
import {
  getAnalyticsSummary,
  getBrowserStats,
  getDailyTrends,
  getDeviceBreakdown,
  getPageCategoryBreakdown,
  getRealtimeStats,
  getTopNotices,
} from './components/analytics/analytics-data';

const ANALYTICS_DAYS = 30;

export const fetchUserCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => prisma.user.count());

export const fetchPublishedNoticeCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() =>
    prisma.artwork.count({
      where: {
        status: ArtworkStatusSchema.enum.PUBLISHED,
      },
    }),
  );

export const fetchAnalyticsOverview = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(async () => {
    const [summary, realtimeStats] = await Promise.all([getAnalyticsSummary(), getRealtimeStats()]);
    return { summary, realtimeStats };
  });

export const fetchDailyTrends = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => getDailyTrends(ANALYTICS_DAYS));

export const fetchDeviceBreakdown = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => getDeviceBreakdown(ANALYTICS_DAYS));

export const fetchPageCategoryBreakdown = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => getPageCategoryBreakdown(ANALYTICS_DAYS));

export const fetchBrowserStats = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => getBrowserStats(ANALYTICS_DAYS));

export const fetchTopNotices = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => getTopNotices(10, ANALYTICS_DAYS));

/**
 * Start every dashboard query without awaiting, so each card streams in behind its own Suspense boundary.
 */
export const loadAdminDashboardData = () => ({
  stats: {
    userCount: fetchUserCount(),
    noticeCount: fetchPublishedNoticeCount(),
  },
  analytics: {
    overview: fetchAnalyticsOverview(),
    dailyTrends: fetchDailyTrends(),
    deviceBreakdown: fetchDeviceBreakdown(),
    pageCategories: fetchPageCategoryBreakdown(),
    browserStats: fetchBrowserStats(),
    topNotices: fetchTopNotices(),
  },
});

export type AdminDashboardData = ReturnType<typeof loadAdminDashboardData>;
