import { StatCard } from '@/components/stats/stat-card';
import { StatCardSkeleton } from '@/components/stats/stat-card-skeleton';
import type { ArtworkStatsData } from '../../actions/artwork-queries';
import { Eye, FileText, NotebookPen, PencilLine } from 'lucide-react';
import { Suspense, use } from 'react';

// Individual components for each artwork stat
function TotalArtworksCard({ count }: { count: Promise<number> }) {
  const totalArtworks = use(count);
  return <StatCard title="Notices" value={totalArtworks} icon={FileText} />;
}

function PublishedArtworksCard({ count }: { count: Promise<number> }) {
  const publishedCount = use(count);
  return <StatCard title="Publiées" value={publishedCount} icon={NotebookPen} tone="success" />;
}

function DraftArtworksCard({ count }: { count: Promise<number> }) {
  const draftCount = use(count);
  return <StatCard title="Brouillons" value={draftCount} icon={PencilLine} tone="warning" />;
}

function TotalViewsCard({ count }: { count: Promise<number> }) {
  const totalViews = use(count);
  return <StatCard title="Vues" value={totalViews} icon={Eye} />;
}

export function ArtworkStats({ data }: { data: ArtworkStatsData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Suspense fallback={<StatCardSkeleton title="Notices" icon={FileText} />}>
        <TotalArtworksCard count={data.total} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Publiées" icon={NotebookPen} />}>
        <PublishedArtworksCard count={data.published} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Brouillons" icon={PencilLine} />}>
        <DraftArtworksCard count={data.drafts} />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton title="Vues" icon={Eye} />}>
        <TotalViewsCard count={data.views} />
      </Suspense>
    </div>
  );
}
