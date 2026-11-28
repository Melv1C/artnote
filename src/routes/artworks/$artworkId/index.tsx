import { NotFound } from '@/components/layout/not-found';
import { fetchPublishedArtwork } from '@/features/artworks/actions/artwork-queries';
import { noticeParams } from '@/features/artworks/lib/notice-slug';
import { createFileRoute, redirect } from '@tanstack/react-router';

/** A link without the slug, from before notice URLs had one, leads to the current URL. */
export const Route = createFileRoute('/artworks/$artworkId/')({
  loader: async ({ params }) => {
    const artwork = await fetchPublishedArtwork({ data: params.artworkId });
    throw redirect({
      to: '/artworks/$artworkId/$slug',
      params: noticeParams(artwork),
      statusCode: 301,
    });
  },
  notFoundComponent: NotFound,
});
