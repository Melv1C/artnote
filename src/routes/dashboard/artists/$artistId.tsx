import { artistFullName } from '@/features/artists/lib/artist-name';
import { FormPage } from '@/components/layout/form-page';
import { ArtistForm } from '@/features/artists/components/artist-form';
import { fetchArtist } from '@/features/artists/actions/artist-queries';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/$artistId')({
  loader: ({ params }) => fetchArtist({ data: params.artistId }),
  head: () => ({ meta: [{ title: pageTitle('Modifier l’artiste') }] }),
  component: EditArtistPage,
});

function EditArtistPage() {
  const artist = Route.useLoaderData();
  return (
    <FormPage title={artistFullName(artist)} description="Modifier l’artiste">
      <ArtistForm artist={artist} />
    </FormPage>
  );
}
