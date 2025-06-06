import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArtworkForm, createArtwork } from '@/features/artworks';

export default function CreateArtworkPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Informations de l'œuvre</CardTitle>
          <CardDescription>
            Remplissez les informations sur l'œuvre d'art et sa notice
            explicative
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtworkForm
            createArtwork={createArtwork}
            submitLabel="Créer la notice"
          />
        </CardContent>
      </Card>
    </div>
  );
}
