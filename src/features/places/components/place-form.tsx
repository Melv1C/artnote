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
import { PlaceFormSchema, type AddressResult, type Place } from '@/schemas/place';
import { z } from '@/lib/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ClientOnly, useNavigate } from '@tanstack/react-router';
import {
  lazy,
  Suspense,
  useCallback,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { createPlace, updatePlace } from '../actions/place-mutations';
import { MapErrorBoundary } from './map-error-boundary';
import { PlaceAddressSearch } from './place-address-search';
import { placeKeys } from '../hooks/use-places';
import { applyAddressResult, type AddressFields } from '../lib/address-search';
import { formatCoordinate, parsePosition, type PlacePosition } from '../lib/place-position';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

// MapLibre runs in the browser only and is heavy: the map loads on demand, after hydration
const PlacePositionMap = lazy(() => import('./place-position-map'));

type FieldErrors = Partial<Record<keyof z.infer<typeof PlaceFormSchema>, string[]>>;

interface PlaceFormProps {
  /** The place to edit; omit to create one. */
  place?: Place;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  // The fields hold what the writer typed; the map shows it once it is a valid position
  const [fields, setFields] = useState<AddressFields>({
    latitude: place?.latitude?.toString() ?? '',
    longitude: place?.longitude?.toString() ?? '',
    address: place?.address ?? '',
    city: place?.city ?? '',
    country: place?.country ?? '',
  });
  const position = parsePosition(fields.latitude, fields.longitude);
  const setField = (name: keyof AddressFields) => (value: string) =>
    setFields(current => ({ ...current, [name]: value }));

  const handleMapChange = useCallback((next: PlacePosition) => {
    setFields(current => ({
      ...current,
      latitude: formatCoordinate(next.latitude),
      longitude: formatCoordinate(next.longitude),
    }));
  }, []);

  // A picked result moves the map to it, not only the marker
  const [focus, setFocus] = useState<PlacePosition | null>(null);
  const handleAddressPick = (result: AddressResult) => {
    setFields(current => applyAddressResult(current, result));
    setFocus({ latitude: result.latitude, longitude: result.longitude });
  };

  const [errors, setErrors] = useState<FieldErrors>({});

  // onSubmit, not a form action: React resets a form after its action runs, which would empty
  // the fields of a refused save or bring back the saved values
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = PlaceFormSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const fieldErrors: FieldErrors = z.flattenError(parsed.error).fieldErrors;
      setErrors(fieldErrors);
      // The first field at fault, in the form's order, so the writer sees what to fix
      const first = Array.from(form.elements).find(element =>
        Object.hasOwn(fieldErrors, element.id),
      );
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    setErrors({});

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

  const invalid = (name: keyof FieldErrors) =>
    errors[name] ? { 'aria-invalid': true, 'aria-describedby': `${name}-error` } : {};

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" name="name" defaultValue={place?.name} required {...invalid('name')} />
          <FieldError name="name" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select name="type" defaultValue={place?.type} required>
            <SelectTrigger id="type" {...invalid('type')}>
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
          <FieldError name="type" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            id="address"
            name="address"
            value={fields.address}
            onChange={event => setField('address')(event.target.value)}
            {...invalid('address')}
          />
          <FieldError name="address" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            name="city"
            value={fields.city}
            onChange={event => setField('city')(event.target.value)}
            {...invalid('city')}
          />
          <FieldError name="city" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            id="country"
            name="country"
            value={fields.country}
            onChange={event => setField('country')(event.target.value)}
            {...invalid('country')}
          />
          <FieldError name="country" errors={errors} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            id="website"
            name="website"
            type="url"
            defaultValue={place?.website || ''}
            placeholder="https://example.com"
            {...invalid('website')}
          />
          <FieldError name="website" errors={errors} />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium leading-none">Position *</legend>
        <p className="text-sm text-muted-foreground">
          Recherchez une adresse, cliquez sur la carte ou faites glisser le repère, ou saisissez la
          latitude et la longitude.
        </p>
        <PlaceAddressSearch onPick={handleAddressPick} />
        <ClientOnly fallback={<MapPlaceholder />}>
          <MapErrorBoundary
            fallback={
              <MapPlaceholder>
                Carte indisponible : saisissez la latitude et la longitude.
              </MapPlaceholder>
            }
          >
            <Suspense fallback={<MapPlaceholder />}>
              <PlacePositionMap position={position} onChange={handleMapChange} focus={focus} />
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
              value={fields.latitude}
              onChange={event => setField('latitude')(event.target.value)}
              placeholder="Entre −90 et 90"
              {...invalid('latitude')}
            />
            <FieldError name="latitude" errors={errors} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              value={fields.longitude}
              onChange={event => setField('longitude')(event.target.value)}
              placeholder="Entre −180 et 180"
              {...invalid('longitude')}
            />
            <FieldError name="longitude" errors={errors} />
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
          {...invalid('description')}
        />
        <FieldError name="description" errors={errors} />
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

/** A field's first validation message, beside it; `aria-describedby` points to its id. */
function FieldError({ name, errors }: { name: keyof FieldErrors; errors: FieldErrors }) {
  const message = errors[name]?.[0];
  if (!message) return null;
  return (
    <p id={`${name}-error`} className="text-sm text-destructive">
      {message}
    </p>
  );
}
