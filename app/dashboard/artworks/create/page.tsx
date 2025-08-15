import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArtworkForm, createArtwork } from '@/features/artworks';

export default function CreateArtworkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Créer une nouvelle notice</h1>
        <p className="text-muted-foreground">
          Remplissez les informations sur l'œuvre d'art et sa notice explicative
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'œuvre</CardTitle>
          <CardDescription>Remplissez les détails de l'œuvre d'art</CardDescription>
        </CardHeader>
        <CardContent>
          <ArtworkForm
            onSubmit={createArtwork}
            submitLabel="Créer la notice"
            successMessage="Notice créée avec succès !"
          />
        </CardContent>
      </Card>
    </div>
  );
}
