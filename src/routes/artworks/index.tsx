import { ArtworksFilter, ArtworksList, ArtworksListSkeleton } from '@/features/artworks/components';
import { ArtworksSearchSchema, toArtworkFilters } from '@/features/artworks';
import { fetchFilteredArtworks } from '@/features/artworks/actions';
import { pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/artworks/')({
  validateSearch: ArtworksSearchSchema,
  loaderDeps: ({ search }) => toArtworkFilters(search),
  // Not awaited: the list streams in behind its Suspense skeleton
  loader: ({ deps }) => ({ artworks: fetchFilteredArtworks({ data: deps }) }),
  head: () => ({
    meta: pageMeta(
      'ArtNote - Toutes les notices',
      "Explorez toutes les notices sur l'histoire de la peinture disponibles sur ArtNote.",
    ),
  }),
  component: ArtworksPage,
});

function ArtworksPage() {
  const { artworks } = Route.useLoaderData();

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="max-w-2xl mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Toutes les notices</h1>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ArtworksFilter />
      </div>

      {/* Artworks List */}
      <Suspense fallback={<ArtworksListSkeleton />}>
        <ArtworksList artworksPromise={artworks} />
      </Suspense>
    </div>
  );
}
