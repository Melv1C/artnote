import { NotFound } from '@/components/layout/not-found';
import { fetchPublishedArtwork } from '@/features/artworks/actions/artwork-queries';
import { useNoticeReading } from '@/features/analytics/hooks/use-notice-reading';
import { useRecordNoticeView } from '@/features/artworks/hooks/use-record-notice-view';
import { ArtworkDetail } from '@/features/artworks/components/artwork-detail';
import { artistNames, mainImage } from '@/features/artworks/lib/artwork-display';
import { DEFAULT_OG_IMAGE, ogImageMeta, pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';
import type { RootLoaderData } from '../../__root';

export const Route = createFileRoute('/artworks/$artworkId/')({
  loader: ({ params }) => fetchPublishedArtwork({ data: params.artworkId }),
  head: ({ loaderData: artwork, matches }) => {
    if (!artwork) {
      return { meta: [{ title: 'ArtNote - Œuvre non trouvée' }] };
    }

    const { siteUrl } = (matches[0]?.loaderData ?? { siteUrl: '' }) as RootLoaderData;
    const artists = artistNames(artwork.artists);
    const image = mainImage(artwork.images)?.image;

    return {
      meta: [
        ...pageMeta(
          `ArtNote - ${artwork.title}`,
          `Découvrez la notice "${artwork.title}"${artists ? ` de ${artists}` : ''}.`,
        ),
        ...ogImageMeta(siteUrl, [
          image
            ? {
                url: image.url,
                width: image.width ?? undefined,
                height: image.height ?? undefined,
                alt: artwork.title,
              }
            : DEFAULT_OG_IMAGE,
        ]),
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
