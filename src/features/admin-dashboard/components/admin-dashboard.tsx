import { PageHeader } from '@/components/layout/page-header';
import {
  RecentNotices,
  RecentNoticesSkeleton,
} from '@/features/artworks/components/admin/recent-notices';
import { Suspense } from 'react';
import type { AdminDashboardData } from '../actions/dashboard-queries';
import { QuickActions } from './quick-actions';
import { StatsOverview } from './stats-overview';

export function AdminDashboard({ data, name }: { data: AdminDashboardData; name: string }) {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description={`Bonjour ${name.split(' ')[0]}, voici où en est ArtNote.`}
      />
      <StatsOverview data={data} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Suspense fallback={<RecentNoticesSkeleton />}>
          <RecentNotices artworks={data.myArtworks} />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}
