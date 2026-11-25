import { ArtworkCard } from '@/features/artworks/components/artwork-card';
import { ArtworksListSkeleton } from '@/features/artworks/components/artworks-list-skeleton';
import { fetchLatestPublishedArtworks } from '@/features/artworks/actions/artwork-queries';
import { formatLongDate } from '@/lib/format';
import { pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, use } from 'react';

export const Route = createFileRoute('/whats-new')({
  // Not awaited: the list streams in behind its Suspense skeleton
  loader: () => ({ latestArtworks: fetchLatestPublishedArtworks({ data: 12 }) }),
  head: () => ({
    meta: pageMeta('ArtNote - Nouveautés', 'Découvrez les dernières notices publiées sur ArtNote.'),
  }),
  component: WhatsNewPage,
});

function WhatsNewPage() {
  const { latestArtworks } = Route.useLoaderData();

  return (
    <div className="page-width pt-6 pb-10 md:pt-12">
      <header className="mb-8 max-w-2xl md:mb-12">
        <h1 className="font-serif text-4xl font-medium tracking-tight md:text-5xl">Nouveautés</h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Les dernières notices publiées, de la plus récente à la plus ancienne.
        </p>
      </header>

      <Suspense fallback={<ArtworksListSkeleton count={3} />}>
        <LatestList artworksPromise={latestArtworks} />
      </Suspense>
    </div>
  );
}

function LatestList({
  artworksPromise,
}: {
  artworksPromise: ReturnType<typeof fetchLatestPublishedArtworks>;
}) {
  const latestArtworks = use(artworksPromise);

  if (latestArtworks.length === 0) {
    return (
      <p className="py-16 text-center text-lg text-muted-foreground">
        Aucune notice publiée pour l’instant. Revenez bientôt.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {latestArtworks.map((artwork, index) => (
        <li key={artwork.id} className="flex flex-col gap-3">
          {artwork.publishedAt && (
            <p className="text-xs font-medium text-muted-foreground">
              Publiée le{' '}
              <time dateTime={new Date(artwork.publishedAt).toISOString()}>
                {formatLongDate(artwork.publishedAt)}
              </time>
            </p>
          )}
          <ArtworkCard artwork={artwork} priority={index < 2} />
        </li>
      ))}
    </ul>
  );
}
