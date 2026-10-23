import { ArtworkCard, ArtworksListSkeleton } from '@/features/artworks';
import { fetchLatestPublishedArtworks } from '@/features/artworks/actions';
import { pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, use } from 'react';

export const Route = createFileRoute('/whats-new')({
  // Not awaited: the list streams in behind its Suspense skeleton
  loader: () => ({ latestArtworks: fetchLatestPublishedArtworks({ data: 3 }) }),
  head: () => ({
    meta: pageMeta('ArtNote - Nouveautés', 'Découvrez les dernières notices publiées sur ArtNote.'),
  }),
  component: WhatsNewPage,
});

function WhatsNewPage() {
  const { latestArtworks } = Route.useLoaderData();

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Nouveautés</h1>
      </div>

      <Suspense fallback={<ArtworksListSkeleton />}>
        <ArtworksList artworksPromise={latestArtworks} />
      </Suspense>
    </div>
  );
}

function ArtworksList({
  artworksPromise,
}: {
  artworksPromise: ReturnType<typeof fetchLatestPublishedArtworks>;
}) {
  const latestArtworks = use(artworksPromise);

  if (latestArtworks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Aucune notice publiée récemment.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {latestArtworks.map(artwork => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  );
}
