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

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema, UserRoleSchema } from '@/schemas';
import { NotebookPen, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Suspense } from 'react';

type StatCardProps = {
  title: string;
  value: string | number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; // Lucide icon component
  subtitle?: string;
};

// Skeleton component for loading states
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StatCardSkeleton({ title, icon: Icon }: { title: string; icon: any }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

// Reusable stat card component
function StatCard({ title, value, icon: Icon, subtitle }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Individual async components for each stat
async function UserCountCard() {
  const userCount = await prisma.user.count();
  return <StatCard title="Utilisateurs Total" value={userCount} icon={Users} />;
}

async function WriterCountCard() {
  const writerCount = await prisma.user.count({
    where: {
      role: UserRoleSchema.Values.WRITER,
    },
  });
  return (
    <StatCard title="Rédacteurs Actifs" value={writerCount} icon={UserCheck} />
  );
}

async function NoticeCountCard() {
  const noticeCount = await prisma.artwork.count({
    where: {
      status: ArtworkStatusSchema.Values.PUBLISHED,
    },
  });
  return (
    <StatCard title="Notices Publiées" value={noticeCount} icon={NotebookPen} />
  );
}

async function ViewsCountCard() {
  // Get views from the last 30 days for "monthly" count
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const viewsCount = await prisma.pageView.count({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
  });
  return (
    <StatCard
      title="Vues Mensuelles"
      value={`${(viewsCount / 1000).toFixed(1)}K`}
      icon={TrendingUp}
    />
  );
}

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Suspense
        fallback={<StatCardSkeleton title="Utilisateurs Total" icon={Users} />}
      >
        <UserCountCard />
      </Suspense>

      <Suspense
        fallback={
          <StatCardSkeleton title="Rédacteurs Actifs" icon={UserCheck} />
        }
      >
        <WriterCountCard />
      </Suspense>

      <Suspense
        fallback={
          <StatCardSkeleton title="Notices Publiées" icon={NotebookPen} />
        }
      >
        <NoticeCountCard />
      </Suspense>

      <Suspense
        fallback={
          <StatCardSkeleton title="Vues Mensuelles" icon={TrendingUp} />
        }
      >
        <ViewsCountCard />
      </Suspense>
    </div>
  );
}
