import { NotFound } from '@/components/layout/not-found';
import { fetchPublishedArtwork } from '@/features/artworks/actions/artwork-queries';
import { useNoticeReading } from '@/features/analytics/hooks/use-notice-reading';
import { useRecordNoticeView } from '@/features/artworks/hooks/use-record-notice-view';
import { ArtworkDetail } from '@/features/artworks/components/artwork-detail';
import { artistNames, mainImage } from '@/features/artworks/lib/artwork-display';
import { DEFAULT_OG_IMAGE, ogImageMeta, pageMeta, pageTitle } from '@/lib/seo';
import { noticeParams } from '@/features/artworks/lib/notice-slug';
import { createFileRoute, redirect } from '@tanstack/react-router';
import type { RootLoaderData } from '../../__root';

export const Route = createFileRoute('/artworks/$artworkId/$slug')({
  loader: async ({ params }) => {
    const artwork = await fetchPublishedArtwork({ data: params.artworkId });
    const current = noticeParams(artwork);
    // An outdated slug, after a title change, leads to the current URL
    if (params.slug !== current.slug) {
      throw redirect({ to: '/artworks/$artworkId/$slug', params: current, statusCode: 301 });
    }
    return artwork;
  },
  head: ({ loaderData: artwork, matches }) => {
    if (!artwork) {
      return { meta: [{ title: pageTitle('Œuvre non trouvée') }] };
    }

    const { siteUrl } = (matches[0]?.loaderData ?? { siteUrl: '' }) as RootLoaderData;
    const artists = artistNames(artwork.artists);
    const url = new URL(`/artworks/${artwork.id}/${noticeParams(artwork).slug}`, siteUrl);
    const image = mainImage(artwork.images)?.image;

    return {
      meta: [
        ...pageMeta(
          pageTitle(artwork.title),
          `Découvrez la notice "${artwork.title}"${artists ? ` de ${artists}` : ''}.`,
        ),
        { property: 'og:url', content: url.toString() },
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
