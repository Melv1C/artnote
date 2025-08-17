import { ArtworkCard, ArtworksListSkeleton } from '@/features/artworks';
import { getLatestPublishedArtworks } from '@/features/artworks/actions';
import { Suspense } from 'react';

export const metadata = {
  title: 'Nouveautés - ArtNote',
};

export default async function WhatsNewPage() {
  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Nouveautés</h1>
        <p className="text-lg text-muted-foreground">
          Découvrez les dernières notices d'œuvres d'art publiées par nos rédacteurs experts.
        </p>
      </div>

      <Suspense fallback={<ArtworksListSkeleton />}>
        <ArtworksList />
      </Suspense>
    </div>
  );
}

async function ArtworksList() {
  const latestArtworks = await getLatestPublishedArtworks(12);

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
