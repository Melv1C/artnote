/**
 * UserStatsOverview Component with Suspense Loading
 *
 * Similar to the admin dashboard stats, this component displays user-specific
 * statistics with individual loading states for better UX. Data comes from deferred loader promises.
 */

import { StatCard } from '@/components/stats/stat-card';
import { StatCardSkeleton } from '@/components/stats/stat-card-skeleton';
import { Activity, Shield, Users } from 'lucide-react';
import { Suspense, use } from 'react';
import type { UserStatsData } from '../actions/user-queries';

// Individual components for each user stat
function TotalUsersCard({ count }: { count: Promise<number> }) {
  const totalUsers = use(count);
  return <StatCard title="Comptes" value={totalUsers} icon={Users} />;
}

function AdminUsersCard({ count }: { count: Promise<number> }) {
  const adminCount = use(count);
  return <StatCard title="Administrateurs" value={adminCount} icon={Shield} />;
}

function NewUsersThisWeekCard({ counts }: { counts: UserStatsData['newUsers'] }) {
  const { newUsersThisWeek, newUsersLastWeek } = use(counts);

  // A percentage means nothing against an empty week: give last week's count instead
  const subtitle =
    newUsersLastWeek === 0
      ? 'Aucune inscription la semaine dernière'
      : `${newUsersLastWeek} inscription${newUsersLastWeek > 1 ? 's' : ''} la semaine dernière`;

  return (
    <StatCard
      title="Nouveaux cette semaine"
      value={newUsersThisWeek}
      icon={Activity}
      subtitle={subtitle}
    />
  );
}

export function UserStatsOverview({ data }: { data: UserStatsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Suspense fallback={<StatCardSkeleton title="Comptes" icon={Users} />}>
        <TotalUsersCard count={data.totalUsers} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Administrateurs" icon={Shield} />}>
        <AdminUsersCard count={data.adminCount} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Nouveaux cette semaine" icon={Activity} />}>
        <NewUsersThisWeekCard counts={data.newUsers} />
      </Suspense>
    </div>
  );
}
