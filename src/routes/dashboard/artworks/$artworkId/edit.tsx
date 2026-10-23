import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArtworkForm, updateArtwork } from '@/features/artworks';
import { fetchMyArtworkForEdit } from '@/features/artworks/actions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artworks/$artworkId/edit')({
  loader: ({ params }) => fetchMyArtworkForEdit({ data: params.artworkId }),
  component: EditArtworkPage,
});

function EditArtworkPage() {
  const { artworkId } = Route.useParams();
  const parsed = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modifier la notice</h1>
        <p className="text-muted-foreground">Mettez à jour les informations de l'œuvre d'art</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'œuvre</CardTitle>
          <CardDescription>Modifiez les détails de l'œuvre d'art</CardDescription>
        </CardHeader>
        <CardContent>
          <ArtworkForm
            initialValues={parsed}
            onSubmit={data => updateArtwork({ data: { artworkId, data } })}
            submitLabel="Mettre à jour"
            successMessage="Notice mise à jour avec succès !"
          />
        </CardContent>
      </Card>
    </div>
  );
}
