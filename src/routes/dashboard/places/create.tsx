import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceForm } from '@/features/places';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/create')({
  component: CreatePlacePage,
});

function CreatePlacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Créer un nouveau lieu</h1>
        <p className="text-muted-foreground mt-2">
          Ajoutez un nouveau lieu d'exposition ou de conservation
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du lieu</CardTitle>
          <CardDescription>Renseignez les informations principales du lieu</CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
