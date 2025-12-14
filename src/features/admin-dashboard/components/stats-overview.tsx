/**
 * StatsOverview Component with Suspense Loading
 *
 * This component implements a performance-optimized approach using React Suspense
 * to display admin dashboard statistics. Each stat card loads independently with
 * its own skeleton loader, preventing any single slow query from blocking the
 * entire dashboard.
 *
 * Architecture:
 * - Each stat has its own async server component
 * - Individual Suspense boundaries for each card
 * - Skeleton loaders maintain layout consistency during loading
 * - Non-blocking loading allows for better UX
 */

import { StatCard, StatCardSkeleton } from '@/components/stats';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas';
import { NotebookPen, Users } from 'lucide-react';
import { Suspense } from 'react';

// Individual async components for each stat
async function UserCountCard() {
  const userCount = await prisma.user.count();
  return <StatCard title="Utilisateurs Total" value={userCount} icon={Users} />;
}

async function NoticeCountCard() {
  const noticeCount = await prisma.artwork.count({
    where: {
      status: ArtworkStatusSchema.enum.PUBLISHED,
    },
  });
  return <StatCard title="Notices Publiées" value={noticeCount} icon={NotebookPen} />;
}

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Suspense fallback={<StatCardSkeleton title="Utilisateurs Total" icon={Users} />}>
        <UserCountCard />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Notices Publiées" icon={NotebookPen} />}>
        <NoticeCountCard />
      </Suspense>
    </div>
  );
}
