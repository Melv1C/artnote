import { Suspense } from 'react';
import type { AdminDashboardData } from '../actions/dashboard-queries';
import { DashboardHeader } from './dashboard-header';
import { QuickActions } from './quick-actions';
import { RecentNotices, RecentNoticesSkeleton } from './recent-notices';
import { StatsOverview } from './stats-overview';

export function AdminDashboard({ data, name }: { data: AdminDashboardData; name: string }) {
  return (
    <div className="space-y-8">
      <DashboardHeader name={name} />
      <StatsOverview data={data.stats} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Suspense fallback={<RecentNoticesSkeleton />}>
          <RecentNotices artworks={data.myArtworks} />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}
