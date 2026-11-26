import { PageHeader } from '@/components/layout/page-header';
import { QuickActions } from '@/features/admin-dashboard/components/quick-actions';
import { StatsOverview } from '@/features/admin-dashboard/components/stats-overview';
import {
  fetchMyArtworks,
  fetchPublishedArtworkCount,
} from '@/features/artworks/actions/artwork-queries';
import {
  RecentNotices,
  RecentNoticesSkeleton,
} from '@/features/artworks/components/admin/recent-notices';
import { fetchUserStats } from '@/features/user-management/actions/user-queries';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/dashboard/')({
  // Not awaited: each card streams in behind its own skeleton. Audience figures live in Umami
  // (ADR 0010), not here.
  loader: () => ({
    userStats: fetchUserStats(),
    publishedCount: fetchPublishedArtworkCount(),
    myArtworks: fetchMyArtworks(),
  }),
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = Route.useRouteContext();
  const { userStats, publishedCount, myArtworks } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description={`Bonjour ${user.name.split(' ')[0]}, voici où en est ArtNote.`}
      />
      <StatsOverview userStats={userStats} publishedCount={publishedCount} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Suspense fallback={<RecentNoticesSkeleton />}>
          <RecentNotices artworks={myArtworks} />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}
