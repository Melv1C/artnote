import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PlaceTypeSchema } from '@/schemas/common';
import { PlaceFormSchema, type Place } from '@/schemas/place';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { createPlace, updatePlace } from '../actions/place-mutations';
import { placeKeys } from '../hooks/use-places';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

interface PlaceFormProps {
  /** The place to edit; omit to create one. */
  place?: Place;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const parsed = PlaceFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Formulaire invalide');
      return;
    }

    startTransition(async () => {
      try {
        if (place) {
          await updatePlace({ data: { ...parsed.data, id: place.id } });
        } else {
          await createPlace({ data: parsed.data });
        }
        await queryClient.invalidateQueries({ queryKey: placeKeys.all });
        toast.success(place ? 'Lieu modifié' : 'Lieu créé');
        await navigate({ to: '/dashboard/places' });
      } catch (error) {
        console.error('Saving place failed:', error);
        toast.error('Erreur lors de l’enregistrement du lieu');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" defaultValue={place?.name} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select name="type" defaultValue={place?.type} required>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              {PlaceTypeSchema.options.map(type => (
                <SelectItem key={type} value={type}>
                  {PLACE_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" defaultValue={place?.address || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" defaultValue={place?.city || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input id="country" name="country" defaultValue={place?.country || ''} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={place?.website || ''}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            defaultValue={place?.latitude ?? ''}
            placeholder="48.8566"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            defaultValue={place?.longitude ?? ''}
            placeholder="2.3522"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={place?.description || ''}
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate({ to: '/dashboard/places' })}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Enregistrement…' : place ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
