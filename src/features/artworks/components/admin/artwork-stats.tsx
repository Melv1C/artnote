import { StatCard, StatCardSkeleton } from '@/components/stats';
import { fetchMyArtworkCount } from '../../actions/artwork-queries';
import { Archive, FileText, NotebookPen, TrendingUp } from 'lucide-react';
import { Suspense, use } from 'react';

/**
 * Start every artwork stat query without awaiting, so each card streams in independently.
 */
export const loadArtworkStats = () => ({
  total: fetchMyArtworkCount({ data: undefined }),
  published: fetchMyArtworkCount({ data: 'PUBLISHED' }),
  drafts: fetchMyArtworkCount({ data: 'DRAFT' }),
});

export type ArtworkStatsData = ReturnType<typeof loadArtworkStats>;

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

function TotalViewsCard() {
  const totalViews = 0; // Placeholder for total views logic
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
        <TotalViewsCard />
      </Suspense>
    </div>
  );
}
