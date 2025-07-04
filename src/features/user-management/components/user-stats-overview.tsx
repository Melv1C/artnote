/**
 * UserStatsOverview Component with Suspense Loading
 *
 * Similar to the admin dashboard stats, this component displays user-specific
 * statistics with individual loading states for better UX.
 */

import { StatCard, StatCardSkeleton } from '@/components/stats';
import { prisma } from '@/lib/prisma';
import { UserRoleSchema } from '@/schemas';
import { Activity, Shield, UserCheck, Users } from 'lucide-react';
import { Suspense } from 'react';

// Individual async components for each user stat
async function TotalUsersCard() {
  const totalUsers = await prisma.user.count();
  return (
    <StatCard title="Total Utilisateurs" value={totalUsers} icon={Users} />
  );
}

async function AdminUsersCard() {
  const adminCount = await prisma.user.count({
    where: {
      role: UserRoleSchema.Values.admin,
    },
  });
  return <StatCard title="Administrateurs" value={adminCount} icon={Shield} />;
}

async function WriterUsersCard() {
  const writerCount = await prisma.user.count({
    where: {
      role: UserRoleSchema.Values.writer,
    },
  });
  return <StatCard title="Rédacteurs" value={writerCount} icon={UserCheck} />;
}

async function NewUsersThisWeekCard() {
  // Calculate date ranges
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  // Get new users this week
  const newUsersThisWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfThisWeek,
      },
    },
  });

  // Get new users last week for comparison
  const newUsersLastWeek = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfLastWeek,
        lt: startOfThisWeek,
      },
    },
  });

  // Calculate percentage change
  const percentageChange =
    newUsersLastWeek === 0
      ? newUsersThisWeek > 0
        ? 100
        : 0
      : Math.round(
          ((newUsersThisWeek - newUsersLastWeek) / newUsersLastWeek) * 100
        );

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

export function UserStatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Suspense
        fallback={<StatCardSkeleton title="Total Utilisateurs" icon={Users} />}
      >
        <TotalUsersCard />
      </Suspense>

      <Suspense
        fallback={<StatCardSkeleton title="Administrateurs" icon={Shield} />}
      >
        <AdminUsersCard />
      </Suspense>

      <Suspense
        fallback={<StatCardSkeleton title="Rédacteurs" icon={UserCheck} />}
      >
        <WriterUsersCard />
      </Suspense>

      <Suspense
        fallback={
          <StatCardSkeleton title="Nouveaux Utilisateurs" icon={Activity} />
        }
      >
        <NewUsersThisWeekCard />
      </Suspense>
    </div>
  );
}
