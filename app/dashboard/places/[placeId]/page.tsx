'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceForm } from '@/features/places';
import { usePlace } from '@/features/places/hooks/use-places';
import { useParams } from 'next/navigation';

export default function EditPlacePage() {
  const params = useParams();
  const placeId = params.placeId as string;

  const { data: place, isLoading, error } = usePlace(placeId);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur lors du chargement du lieu</div>;
  }

  if (!place) {
    return <div>Lieu non trouvé</div>;
  }

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
          <CardDescription>
            Modifiez les informations principales du lieu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlaceForm mode="edit" place={place} />
        </CardContent>
      </Card>
    </div>
  );
}
