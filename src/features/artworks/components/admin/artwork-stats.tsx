import { StatCard } from '@/components/stats/stat-card';
import { StatCardSkeleton } from '@/components/stats/stat-card-skeleton';
import type { ArtworkStatsData } from '../../actions/artwork-queries';
import { Archive, FileText, NotebookPen, TrendingUp } from 'lucide-react';
import { Suspense, use } from 'react';

// Individual components for each artwork stat
function TotalArtworksCard({ count }: { count: Promise<number> }) {
  const totalArtworks = use(count);
  return <StatCard title="Total Notices" value={totalArtworks} icon={FileText} />;
}

function PublishedArtworksCard({ count }: { count: Promise<number> }) {
  const publishedCount = use(count);
  return <StatCard title="Publiées" value={publishedCount} icon={NotebookPen} />;
}

function DraftArtworksCard({ count }: { count: Promise<number> }) {
  const draftCount = use(count);
  return <StatCard title="Brouillons" value={draftCount} icon={Archive} />;
}

function TotalViewsCard({ count }: { count: Promise<number> }) {
  const totalViews = use(count);
  return <StatCard title="Vues Totales" value={totalViews} icon={TrendingUp} />;
}

export function ArtworkStats({ data }: { data: ArtworkStatsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Suspense fallback={<StatCardSkeleton title="Total Notices" icon={FileText} />}>
        <TotalArtworksCard count={data.total} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Publiées" icon={NotebookPen} />}>
        <PublishedArtworksCard count={data.published} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Brouillons" icon={Archive} />}>
        <DraftArtworksCard count={data.drafts} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Vues Totales" icon={TrendingUp} />}>
        <TotalViewsCard count={data.views} />
      </Suspense>
    </div>
  );
}
