import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArtistForm } from '@/features/artists';

export default function CreateArtistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créer un nouvel artiste</h1>
        <p className="text-muted-foreground mt-2">
          Ajoutez un nouvel artiste à la base de données
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'artiste</CardTitle>
          <CardDescription>
            Renseignez les informations principales de l'artiste
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ArtistForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
