import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  ArtworkListAdmin,
  ArtworkListAdminSkeleton,
} from '@/features/artworks/components/admin/artwork-list-admin';
import { ArtworkStats } from '@/features/artworks/components/admin/artwork-stats';
import { fetchMyArtworks, fetchMyArtworkStats } from '@/features/artworks/actions/artwork-queries';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Suspense } from 'react';

export const Route = createFileRoute('/dashboard/artworks/')({
  // Not awaited: stats and list stream in behind their Suspense boundaries
  loader: () => ({
    stats: fetchMyArtworkStats(),
    artworks: fetchMyArtworks(),
  }),
  head: () => ({ meta: [{ title: 'ArtNote - Mes notices' }] }),
  component: ArtworksPage,
});

function ArtworksPage() {
  const { stats, artworks } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mes notices"
        description="Les notices que vous rédigez, de la première ébauche à la publication."
        actions={
          <Button asChild>
            <Link to="/dashboard/artworks/create">
              <Plus />
              Nouvelle notice
            </Link>
          </Button>
        }
      />
      <ArtworkStats stats={stats} />
      <Suspense fallback={<ArtworkListAdminSkeleton />}>
        <ArtworkListAdmin artworks={artworks} />
      </Suspense>
    </div>
  );
}
