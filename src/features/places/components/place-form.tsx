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
import {
  COORDINATE_LIMITS,
  PlaceFormSchema,
  type AddressResult,
  type Place,
} from '@/schemas/place';
import { useValidatedForm } from '@/components/validated-form';
import { runMutation } from '@/lib/run-mutation';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { lazy, useCallback, useState } from 'react';
import { createPlace, updatePlace } from '../actions/place-mutations';
import { MapSlot } from './map-slot';
import { PlaceAddressSearch } from './place-address-search';
import { placeKeys } from '../hooks/use-places';
import { applyAddressResult, type AddressFields } from '../lib/address-search';
import { formatCoordinate, parsePosition, type PlacePosition } from '../lib/place-position';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

const PlacePositionMap = lazy(() => import('./place-position-map'));

const POSITION_MAP_BOX = 'h-72 rounded-md border sm:h-80';

interface PlaceFormProps {
  /** The place to edit; omit to create one. */
  place?: Place;
}

export function PlaceForm({ place }: PlaceFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // The fields hold what the writer typed; the map shows it once it is a valid position
  const [fields, setFields] = useState<AddressFields>({
    latitude: place?.latitude.toString() ?? '',
    longitude: place?.longitude.toString() ?? '',
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

  const { onSubmit, isPending, field, fieldError } = useValidatedForm(
    PlaceFormSchema,
    async data => {
      const saved = await runMutation(
        async () => {
          await (place ? updatePlace({ data: { ...data, id: place.id } }) : createPlace({ data }));
          await queryClient.invalidateQueries({ queryKey: placeKeys.all });
        },
        {
          success: place ? 'Lieu modifié' : 'Lieu créé',
          failure: 'Le lieu n’a pas pu être enregistré.',
        },
      );
      if (saved) await navigate({ to: '/dashboard/places' });
    },
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input defaultValue={place?.name} required {...field('name')} />
          {fieldError('name')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Type *</Label>
          <Select name="type" defaultValue={place?.type} required>
            <SelectTrigger {...field('type')} className="w-full">
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
          {fieldError('type')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input
            value={fields.address}
            onChange={event => setField('address')(event.target.value)}
            {...field('address')}
          />
          {fieldError('address')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input
            value={fields.city}
            onChange={event => setField('city')(event.target.value)}
            {...field('city')}
          />
          {fieldError('city')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays</Label>
          <Input
            value={fields.country}
            onChange={event => setField('country')(event.target.value)}
            {...field('country')}
          />
          {fieldError('country')}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Site web</Label>
          <Input
            type="url"
            defaultValue={place?.website || ''}
            placeholder="https://example.com"
            {...field('website')}
          />
          {fieldError('website')}
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium leading-none">Position *</legend>
        <p className="text-sm text-muted-foreground">
          Recherchez une adresse, cliquez sur la carte ou faites glisser le repère, ou saisissez la
          latitude et la longitude.
        </p>
        <PlaceAddressSearch onPick={handleAddressPick} />
        <MapSlot
          unavailable="Carte indisponible : saisissez la latitude et la longitude."
          className={POSITION_MAP_BOX}
        >
          <PlacePositionMap
            position={position}
            onChange={handleMapChange}
            focus={focus}
            className={POSITION_MAP_BOX}
          />
        </MapSlot>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude *</Label>
            <Input
              type="number"
              step="any"
              value={fields.latitude}
              onChange={event => setField('latitude')(event.target.value)}
              placeholder={`Entre −${COORDINATE_LIMITS.latitude} et ${COORDINATE_LIMITS.latitude}`}
              {...field('latitude')}
            />
            {fieldError('latitude')}
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude *</Label>
            <Input
              type="number"
              step="any"
              value={fields.longitude}
              onChange={event => setField('longitude')(event.target.value)}
              placeholder={`Entre −${COORDINATE_LIMITS.longitude} et ${COORDINATE_LIMITS.longitude}`}
              {...field('longitude')}
            />
            {fieldError('longitude')}
          </div>
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea defaultValue={place?.description || ''} rows={4} {...field('description')} />
        {fieldError('description')}
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
