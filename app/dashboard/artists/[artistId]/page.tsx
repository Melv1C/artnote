'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArtistForm } from '@/features/artists';
import { useArtist } from '@/features/artists/hooks/use-artists';
import { useParams } from 'next/navigation';

export default function EditArtistPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const { data: artist, isLoading, error } = useArtist(artistId);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur lors du chargement de l'artiste</div>;
  }

  if (!artist) {
    return <div>Artiste non trouvé</div>;
  }

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
          <ArtistForm mode="edit" artist={artist} />
        </CardContent>
      </Card>
    </div>
  );
}
