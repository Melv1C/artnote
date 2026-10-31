import {
  ArtworkHeader,
  ArtworkListAdmin,
  ArtworkListSkeleton,
  ArtworkStats,
  loadArtworkStats,
} from '@/features/artworks';
import { changeArtworkStatus, deleteArtwork, fetchMyArtworks } from '@/features/artworks/actions';
import { createFileRoute, useRouter } from '@tanstack/react-router';
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
    <div className="space-y-6">
      {/* Header */}
      <ArtworkHeader />

      {/* Stats Cards */}
      <ArtworkStats data={stats} />

      {/* Main Content with ArtworkList */}
      <div>
        <Suspense fallback={<ArtworkListSkeleton />}>
          <ArtworkListWrapper artworksPromise={artworks} />
        </Suspense>
      </div>
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

  // Reload the route data after a mutation (replaces Next's revalidatePath)
  const handleDelete = async (artworkId: string) => {
    const result = await deleteArtwork({ data: artworkId });
    await router.invalidate();
    return result;
  };

  const handleStatusChange = async (artworkId: string, newStatus: string) => {
    const result = await changeArtworkStatus({ data: { artworkId, newStatus } });
    await router.invalidate();
    return result;
  };

  return (
    <ArtworkListAdmin
      initialArtworks={initialArtworks}
      onDelete={handleDelete}
      onStatusChange={handleStatusChange}
    />
  );
}
