import { StatCard, StatCardSkeleton } from '@/components/stats';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkStatusSchema } from '@/schemas';
import { Archive, FileText, NotebookPen, TrendingUp } from 'lucide-react';
import { Suspense } from 'react';

// Individual async components for each artwork stat
async function TotalArtworksCard() {
  const totalArtworks = await prisma.artwork.count({
    where: {
      writerId: (await getRequiredUser()).id,
    },
  });
  return (
    <StatCard title="Total Notices" value={totalArtworks} icon={FileText} />
  );
}

async function PublishedArtworksCard() {
  const publishedCount = await prisma.artwork.count({
    where: {
      status: ArtworkStatusSchema.Values.PUBLISHED,
      writerId: (await getRequiredUser()).id,
    },
  });
  return (
    <StatCard title="Publiées" value={publishedCount} icon={NotebookPen} />
  );
}

async function DraftArtworksCard() {
  const draftCount = await prisma.artwork.count({
    where: {
      status: ArtworkStatusSchema.Values.DRAFT,
      writerId: (await getRequiredUser()).id,
    },
  });
  return <StatCard title="Brouillons" value={draftCount} icon={Archive} />;
}

async function TotalViewsCard() {
  const totalViews = 0; // Placeholder for total views logic
  return <StatCard title="Vues Totales" value={totalViews} icon={TrendingUp} />;
}

export function ArtworkStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Suspense
        fallback={<StatCardSkeleton title="Total Notices" icon={FileText} />}
      >
        <TotalArtworksCard />
      </Suspense>

      <Suspense
        fallback={<StatCardSkeleton title="Publiées" icon={NotebookPen} />}
      >
        <PublishedArtworksCard />
      </Suspense>

      <Suspense
        fallback={<StatCardSkeleton title="Brouillons" icon={Archive} />}
      >
        <DraftArtworksCard />
      </Suspense>

      <Suspense
        fallback={<StatCardSkeleton title="Vues Totales" icon={TrendingUp} />}
      >
        <TotalViewsCard />
      </Suspense>
    </div>
  );
}
