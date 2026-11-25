import { ArtworkGrid, ArtworkGridSkeleton } from '@/features/artworks/components/artwork-grid';
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

      <Suspense fallback={<ArtworkGridSkeleton count={3} />}>
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
    <ArtworkGrid
      artworks={latestArtworks}
      above={({ publishedAt }) =>
        publishedAt && (
          <p className="text-xs font-medium text-muted-foreground">
            Publiée le{' '}
            <time dateTime={publishedAt.toISOString()}>{formatLongDate(publishedAt)}</time>
          </p>
        )
      }
    />
  );
}
