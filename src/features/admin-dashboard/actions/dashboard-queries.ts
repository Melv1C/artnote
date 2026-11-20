import {
  fetchAnalyticsOverview,
  fetchBrowserStats,
  fetchDailyTrends,
  fetchDeviceBreakdown,
  fetchPageCategoryBreakdown,
  fetchTopNotices,
} from '@/features/analytics/actions/analytics-queries';
import { fetchTotalUserCount } from '@/features/user-management/actions/user-queries';
import { dashboardAccessMiddleware } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas/common';
import { createServerFn } from '@tanstack/react-start';

export const fetchPublishedNoticeCount = createServerFn({ method: 'GET' })
  .middleware([dashboardAccessMiddleware])
  .handler(() => prisma.artwork.count({ where: { status: ArtworkStatusSchema.enum.PUBLISHED } }));

/**
 * Start every dashboard query without awaiting, so each card streams in behind its own Suspense
 * boundary.
 */
export const loadAdminDashboardData = () => ({
  stats: {
    userCount: fetchTotalUserCount(),
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
