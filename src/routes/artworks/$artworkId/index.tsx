import { artistFullName } from '@/features/artists/lib/artist-name';
import { NotFound } from '@/components/layout/not-found';
import { fetchPublishedArtwork } from '@/features/artworks/actions/artwork-queries';
import { useNoticeReading } from '@/features/analytics/hooks/use-notice-reading';
import { useRecordNoticeView } from '@/features/artworks/hooks/use-record-notice-view';
import { ArtworkDetail } from '@/features/artworks/components/artwork-detail';
import { DEFAULT_OG_IMAGE, ogImageMeta, pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/artworks/$artworkId/')({
  loader: ({ params }) => fetchPublishedArtwork({ data: params.artworkId }),
  head: ({ loaderData: artwork, matches }) => {
    if (!artwork) {
      return { meta: [{ title: 'ArtNote - Œuvre non trouvée' }] };
    }

    // The root route's loader data (src/routes/__root.tsx)
    const root = matches[0]?.loaderData as { siteUrl: string } | undefined;
    const siteUrl = root?.siteUrl ?? '';
    const mainImages = artwork.images.filter(image => image.isMain);

    return {
      meta: [
        ...pageMeta(
          `ArtNote - ${artwork.title}`,
          `Découvrez la notice "${artwork.title}" de ${artwork.artists.map(({ artist }) => artistFullName(artist)).join(', ')}.`,
        ),
        ...ogImageMeta(
          siteUrl,
          mainImages.length
            ? mainImages.map(image => ({
                url: image.image.url,
                width: image.image.width || undefined,
                height: image.image.height || undefined,
                alt: artwork.title,
              }))
            : [DEFAULT_OG_IMAGE],
        ),
      ],
    };
  },
  component: ArtworkPage,
  notFoundComponent: NotFound,
});

function ArtworkPage() {
  const artwork = Route.useLoaderData();
  useNoticeReading(artwork.id, artwork.title);
  useRecordNoticeView(artwork.id);

  return <ArtworkDetail artwork={artwork} />;
}
