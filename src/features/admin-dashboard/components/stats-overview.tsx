/**
 * StatsOverview Component with Suspense Loading
 *
 * This component implements a performance-optimized approach using React Suspense
 * to display admin dashboard statistics. Each stat card loads independently with
 * its own skeleton loader, preventing any single slow query from blocking the
 * entire dashboard.
 *
 * Architecture:
 * - Each stat resolves its own deferred loader promise
 * - Individual Suspense boundaries for each card
 * - Skeleton loaders maintain layout consistency during loading
 * - Non-blocking loading allows for better UX
 */

import { StatCard, StatCardSkeleton } from '@/components/stats';
import type { AdminDashboardData } from '../dashboard-queries';
import { NotebookPen, Users } from 'lucide-react';
import { Suspense, use } from 'react';

type StatsOverviewProps = {
  data: AdminDashboardData['stats'];
};

// Individual components for each stat
function UserCountCard({ count }: { count: Promise<number> }) {
  const userCount = use(count);
  return <StatCard title="Utilisateurs Total" value={userCount} icon={Users} />;
}

function NoticeCountCard({ count }: { count: Promise<number> }) {
  const noticeCount = use(count);
  return <StatCard title="Notices Publiées" value={noticeCount} icon={NotebookPen} />;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Suspense fallback={<StatCardSkeleton title="Utilisateurs Total" icon={Users} />}>
        <UserCountCard count={data.userCount} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Notices Publiées" icon={NotebookPen} />}>
        <NoticeCountCard count={data.noticeCount} />
      </Suspense>
    </div>
  );
}
