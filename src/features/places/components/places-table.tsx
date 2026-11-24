import { PagedTable } from '@/components/data-table/paged-table';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { PlaceTypeSchema } from '@/schemas/common';
import { MapPinOff, Search } from 'lucide-react';
import { useState } from 'react';
import { usePlaces } from '../hooks/use-places';
import { PLACE_TYPE_LABELS } from '../lib/place-types';
import { columns } from './places-table-columns';

export function PlacesTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: 'all', city: '', country: '' });
  const [missingPosition, setMissingPosition] = useState(false);
  const debounced = useDebounce(filters, 300);

  const { data, isLoading, isError } = usePlaces({
    page,
    search: debounced.search || undefined,
    type: PlaceTypeSchema.safeParse(debounced.type).data,
    city: debounced.city || undefined,
    country: debounced.country || undefined,
    missingPosition: missingPosition || undefined,
  });

  // A new filter starts again from the first page
  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lieu…"
            aria-label="Rechercher un lieu"
            value={filters.search}
            onChange={event => setFilter('search', event.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.type} onValueChange={value => setFilter('type', value)}>
          <SelectTrigger className="w-48" aria-label="Type de lieu">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {PlaceTypeSchema.options.map(type => (
              <SelectItem key={type} value={type}>
                {PLACE_TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Ville"
          aria-label="Filtrer par ville"
          value={filters.city}
          onChange={event => setFilter('city', event.target.value)}
          className="w-32"
        />
        <Input
          placeholder="Pays"
          aria-label="Filtrer par pays"
          value={filters.country}
          onChange={event => setFilter('country', event.target.value)}
          className="w-32"
        />
        <Toggle
          variant="outline"
          pressed={missingPosition}
          onPressedChange={pressed => {
            setMissingPosition(pressed);
            setPage(1);
          }}
        >
          <MapPinOff />
          Sans position
        </Toggle>
      </div>

      <PagedTable
        columns={columns}
        rows={data?.places ?? []}
        page={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        messages={{ empty: 'Aucun lieu trouvé.', error: 'Erreur lors du chargement des lieux' }}
      />
    </div>
  );
}
