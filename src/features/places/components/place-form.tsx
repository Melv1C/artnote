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
import { ClientOnly, useNavigate } from '@tanstack/react-router';
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { createPlace, updatePlace } from '../actions/place-mutations';
import { placeKeys } from '../hooks/use-places';
import { formatCoordinate, parsePosition, type PlacePosition } from '../lib/place-position';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

// MapLibre runs in the browser only and is heavy: the map loads on demand, after hydration
const PlacePositionMap = lazy(() => import('./place-position-map'));

interface PlaceFormProps {
  /** The place to edit; omit to create one. */
  place?: Place;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  // The fields hold what the writer typed; the map shows it once it is a valid position
  const [latitude, setLatitude] = useState(place?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(place?.longitude?.toString() ?? '');
  const position = parsePosition(latitude, longitude);

  const handleMapChange = useCallback((next: PlacePosition) => {
    setLatitude(formatCoordinate(next.latitude));
    setLongitude(formatCoordinate(next.longitude));
  }, []);

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
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium leading-none">Position *</legend>
        <p className="text-sm text-muted-foreground">
          Cliquez sur la carte ou faites glisser le repère, ou saisissez la latitude et la
          longitude.
        </p>
        <ClientOnly fallback={<MapPlaceholder />}>
          <MapErrorBoundary>
            <Suspense fallback={<MapPlaceholder />}>
              <PlacePositionMap position={position} onChange={handleMapChange} />
            </Suspense>
          </MapErrorBoundary>
        </ClientOnly>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={event => setLatitude(event.target.value)}
              placeholder="50.8467"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={event => setLongitude(event.target.value)}
              placeholder="4.3525"
            />
          </div>
        </div>
      </fieldset>

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

/** The map's space while MapLibre loads, so the form below doesn't jump. */
function MapPlaceholder({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-72 items-center justify-center rounded-md border bg-muted p-4 text-center text-sm text-muted-foreground sm:h-80">
      {children}
    </div>
  );
}

/**
 * Without WebGL, or when the map's code fails to load (a deploy since the page opened), the
 * fields still set the position: the form must not fall with the map.
 */
class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Loading the position map failed:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <MapPlaceholder>Carte indisponible : saisissez la latitude et la longitude.</MapPlaceholder>
    );
  }
}
