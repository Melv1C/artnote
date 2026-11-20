/**
 * UserStatsOverview Component with Suspense Loading
 *
 * Similar to the admin dashboard stats, this component displays user-specific
 * statistics with individual loading states for better UX. Data comes from deferred loader promises.
 */

import { StatCard, StatCardSkeleton } from '@/components/stats';
import { Activity, Shield, UserCheck, Users } from 'lucide-react';
import { Suspense, use } from 'react';
import type { UserStatsData } from '../user-stats-queries';

// Individual components for each user stat
function TotalUsersCard({ count }: { count: Promise<number> }) {
  const totalUsers = use(count);
  return <StatCard title="Total Utilisateurs" value={totalUsers} icon={Users} />;
}

function AdminUsersCard({ count }: { count: Promise<number> }) {
  const adminCount = use(count);
  return <StatCard title="Administrateurs" value={adminCount} icon={Shield} />;
}

function NewUsersThisWeekCard({ counts }: { counts: UserStatsData['newUsers'] }) {
  const { newUsersThisWeek, newUsersLastWeek } = use(counts);

  // Calculate percentage change
  const percentageChange =
    newUsersLastWeek === 0
      ? newUsersThisWeek > 0
        ? 100
        : 0
      : Math.round(((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100);

  const trend = percentageChange > 0 ? '+' : '';
  const subtitle = `${trend}${percentageChange}% vs semaine dernière`;

  return (
    <StatCard
      title="Nouveaux Utilisateurs"
      value={newUsersThisWeek}
      icon={Activity}
      subtitle={subtitle}
    />
  );
}

export function UserStatsOverview({ data }: { data: UserStatsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Suspense fallback={<StatCardSkeleton title="Total Utilisateurs" icon={Users} />}>
        <TotalUsersCard count={data.totalUsers} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Administrateurs" icon={Shield} />}>
        <AdminUsersCard count={data.adminCount} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Nouveaux Utilisateurs" icon={Activity} />}>
        <NewUsersThisWeekCard counts={data.newUsers} />
      </Suspense>
    </div>
  );
}
