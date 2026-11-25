import { StatCard } from '@/components/stat-card';
import { NotebookPen, Users } from 'lucide-react';
import type { fetchPublishedArtworkCount } from '@/features/artworks/actions/artwork-queries';
import type { fetchUserStats } from '@/features/user-management/actions/user-queries';
import { AudienceLinkCard } from './audience-link-card';

export function StatsOverview({
  userStats,
  publishedCount,
}: {
  userStats: ReturnType<typeof fetchUserStats>;
  publishedCount: ReturnType<typeof fetchPublishedArtworkCount>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="Comptes" icon={Users} data={userStats} value={stats => stats.total} />
      <StatCard
        title="Notices publiées"
        icon={NotebookPen}
        tone="success"
        data={publishedCount}
        value={count => count}
      />
      <AudienceLinkCard />
    </div>
  );
}
