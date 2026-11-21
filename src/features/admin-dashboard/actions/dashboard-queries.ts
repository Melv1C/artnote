import { fetchTotalUserCount } from '@/features/user-management/actions/user-queries';
import { fetchPublishedArtworkCount } from '@/features/artworks/actions/artwork-queries';

/**
 * Start every dashboard query without awaiting, so each card streams in behind its own Suspense
 * boundary. Audience figures live in Umami (ADR 0010), not here.
 */
export const loadAdminDashboardData = () => ({
  stats: {
    userCount: fetchTotalUserCount(),
    noticeCount: fetchPublishedArtworkCount(),
  },
});

export type AdminDashboardData = ReturnType<typeof loadAdminDashboardData>;
