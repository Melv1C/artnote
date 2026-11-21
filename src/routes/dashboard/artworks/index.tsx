import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import {
  ArtworkListAdmin,
  ArtworkListSkeleton,
} from '@/features/artworks/components/admin/artwork-list-admin';
import { ArtworkStats } from '@/features/artworks/components/admin/artwork-stats';
import { changeArtworkStatus, deleteArtwork } from '@/features/artworks/actions/artwork-mutations';
import { fetchMyArtworks, loadArtworkStats } from '@/features/artworks/actions/artwork-queries';
import type { ArtworkStatus } from '@/schemas/common';
import { Link, createFileRoute, useRouter } from '@tanstack/react-router';
import { Plus } from 'lucide-react';
import { Suspense, use } from 'react';

export const Route = createFileRoute('/dashboard/artworks/')({
  // Not awaited: stats and list stream in behind their Suspense boundaries
  loader: () => ({
    stats: loadArtworkStats(),
    artworks: fetchMyArtworks(),
  }),
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
      <ArtworkStats data={stats} />
      <Suspense fallback={<ArtworkListSkeleton />}>
        <ArtworkListWrapper artworksPromise={artworks} />
      </Suspense>
    </div>
  );
}

function ArtworkListWrapper({
  artworksPromise,
}: {
  artworksPromise: ReturnType<typeof fetchMyArtworks>;
}) {
  const router = useRouter();
  const initialArtworks = use(artworksPromise);

  // Reload the route data after a mutation
  const handleDelete = async (artworkId: string) => {
    await deleteArtwork({ data: artworkId });
    await router.invalidate();
  };

  const handleStatusChange = async (artworkId: string, status: ArtworkStatus) => {
    await changeArtworkStatus({ data: { artworkId, status } });
    await router.invalidate();
  };

  return (
    <ArtworkListAdmin
      initialArtworks={initialArtworks}
      onDelete={handleDelete}
      onStatusChange={handleStatusChange}
    />
  );
}
