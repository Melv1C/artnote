import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArtistForm } from '@/features/artists/components/artist-form';
import { fetchArtist } from '@/features/artists/actions/artist-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/$artistId')({
  loader: ({ params }) => fetchArtist({ data: params.artistId }),
  component: EditArtistPage,
});

function EditArtistPage() {
  const artist = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier l'artiste</h1>
        <p className="text-muted-foreground mt-2">
          Modifiez les informations de "{artist.firstName} {artist.lastName}"
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'artiste</CardTitle>
          <CardDescription>Modifiez les informations principales de l'artiste</CardDescription>
        </CardHeader>
        <CardContent>
          <ArtistForm artist={artist} />
        </CardContent>
      </Card>
    </div>
  );
}
