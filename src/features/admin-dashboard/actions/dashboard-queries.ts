import { fetchUserStats } from '@/features/user-management/actions/user-queries';
import {
  fetchMyArtworks,
  fetchPublishedArtworkCount,
} from '@/features/artworks/actions/artwork-queries';

/**
 * Start every dashboard query without awaiting, so each card streams in behind its own Suspense
 * boundary. Audience figures live in Umami (ADR 0010), not here.
 */
export const loadAdminDashboardData = () => ({
  userStats: fetchUserStats(),
  publishedCount: fetchPublishedArtworkCount(),
  myArtworks: fetchMyArtworks(),
});

export type AdminDashboardData = ReturnType<typeof loadAdminDashboardData>;
