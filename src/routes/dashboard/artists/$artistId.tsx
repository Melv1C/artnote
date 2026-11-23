import { artistFullName } from '@/features/artists/lib/artist-name';
import { PageHeader } from '@/components/layout/page-header';
import { ArtistForm } from '@/features/artists/components/artist-form';
import { fetchArtist } from '@/features/artists/actions/artist-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/$artistId')({
  loader: ({ params }) => fetchArtist({ data: params.artistId }),
  head: () => ({ meta: [{ title: 'ArtNote - Modifier l’artiste' }] }),
  component: EditArtistPage,
});

function EditArtistPage() {
  const artist = Route.useLoaderData();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader title={artistFullName(artist)} description="Modifier l’artiste" />
      <div className="rounded-xl border bg-card p-6 shadow-xs sm:p-8">
        <ArtistForm artist={artist} />
      </div>
    </div>
  );
}
