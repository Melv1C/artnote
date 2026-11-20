import {
  fetchAnalyticsOverview,
  fetchBrowserStats,
  fetchDailyTrends,
  fetchDeviceBreakdown,
  fetchPageCategoryBreakdown,
  fetchTopNotices,
} from '@/features/analytics/actions/analytics-queries';
import { fetchTotalUserCount } from '@/features/user-management/actions/user-queries';
import { fetchPublishedArtworkCount } from '@/features/artworks/actions/artwork-queries';

/**
 * Start every dashboard query without awaiting, so each card streams in behind its own Suspense
 * boundary.
 */
export const loadAdminDashboardData = () => ({
  stats: {
    userCount: fetchTotalUserCount(),
    noticeCount: fetchPublishedArtworkCount(),
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
