import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceForm } from '@/features/places/components/place-form';
import { fetchPlace } from '@/features/places/actions/place-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/$placeId')({
  loader: ({ params }) => fetchPlace({ data: params.placeId }),
  component: EditPlacePage,
});

function EditPlacePage() {
  const place = Route.useLoaderData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le lieu</h1>
        <p className="text-muted-foreground mt-2">
          Modifiez les informations du lieu "{place.name}"
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du lieu</CardTitle>
          <CardDescription>Modifiez les informations principales du lieu</CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceForm place={place} />
        </CardContent>
      </Card>
    </div>
  );
}
