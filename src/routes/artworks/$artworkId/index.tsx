import { NotFound } from '@/components/layout/not-found';
import { fetchPublishedArtwork } from '@/features/artworks/actions';
import { ArtworkDetail } from '@/features/artworks/components';
import { DEFAULT_OG_IMAGE, ogImageMeta, pageMeta } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/artworks/$artworkId/')({
  loader: ({ params }) => fetchPublishedArtwork({ data: params.artworkId }),
  head: ({ loaderData: artwork, matches }) => {
    if (!artwork) {
      return { meta: [{ title: 'ArtNote - Œuvre non trouvée' }] };
    }

    const siteUrl = (matches[0]?.loaderData as string | undefined) ?? '';
    const mainImages = artwork.images.filter(image => image.isMain);

    return {
      meta: [
        ...pageMeta(
          `ArtNote - ${artwork.title}`,
          `Découvrez la notice "${artwork.title}" de ${artwork.artists.map(artist => `${artist.artist.firstName} ${artist.artist.lastName}`).join(', ')}.`,
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

  return <ArtworkDetail artwork={artwork} />;
}
