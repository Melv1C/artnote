import { ArtworksFilter } from '@/features/artworks/components/artworks-filter';
import { ArtworksList } from '@/features/artworks/components/artworks-list';
import { ArtworkGridSkeleton } from '@/features/artworks/components/artwork-grid';
import { ArtworksSearchSchema, toArtworkFilters } from '@/features/artworks/lib/artwork-search';
import { fetchFilteredArtworks } from '@/features/artworks/actions/artwork-queries';
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
      'Explorez toutes les notices sur l’histoire de la peinture disponibles sur ArtNote.',
    ),
  }),
  component: ArtworksPage,
});

function ArtworksPage() {
  const { artworks } = Route.useLoaderData();
  const { search, artist, place, medium, year } = Route.useLoaderDeps();
  const isFiltered = Boolean(search || artist || place || medium || year);

  return (
    <div className="page-width pt-6 pb-10 md:pt-12">
      <header className="mb-6 max-w-2xl md:mb-8">
        <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Notices</h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Chaque notice raconte une œuvre : son sujet, son histoire, et où la voir.
        </p>
      </header>

      <div className="sticky top-(--header-total) page-bleed z-30 mb-8 bg-background py-3">
        <ArtworksFilter />
      </div>

      <Suspense fallback={<ArtworkGridSkeleton />}>
        <ArtworksList artworksPromise={artworks} isFiltered={isFiltered} />
      </Suspense>
    </div>
  );
}
