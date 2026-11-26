import { PagedTable } from '@/components/data-table/paged-table';
import { SearchInput } from '@/components/data-table/search-input';
import { useTableFilters } from '@/components/data-table/use-table-filters';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toggle } from '@/components/ui/toggle';
import { PlaceTypeSchema } from '@/schemas/common';
import { MapPinOff } from 'lucide-react';
import { usePlaces } from '../hooks/use-places';
import { PLACE_TYPE_LABELS } from '../lib/place-types';
import { columns } from './places-table-columns';

export function PlacesTable() {
  const { page, setPage, filters, debounced, setFilter } = useTableFilters({
    search: '',
    type: 'all',
    city: '',
    country: '',
    missingPosition: false,
  });
  const { data, isLoading, isError } = usePlaces({
    page,
    search: debounced.search || undefined,
    type: PlaceTypeSchema.safeParse(debounced.type).data,
    city: debounced.city || undefined,
    country: debounced.country || undefined,
    missingPosition: debounced.missingPosition || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:flex lg:items-center">
        <div className="col-span-2 flex lg:flex-1">
          <SearchInput
            label="Rechercher un lieu"
            value={filters.search}
            onChange={value => setFilter('search', value)}
          />
        </div>
        <Select value={filters.type} onValueChange={value => setFilter('type', value)}>
          <SelectTrigger className="w-full lg:w-44" aria-label="Type de lieu">
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
        <Toggle
          variant="outline"
          pressed={filters.missingPosition}
          onPressedChange={pressed => setFilter('missingPosition', pressed)}
          className="lg:order-last"
        >
          <MapPinOff />
          Sans position
        </Toggle>
        <Input
          placeholder="Ville"
          aria-label="Filtrer par ville"
          value={filters.city}
          onChange={event => setFilter('city', event.target.value)}
          className="lg:w-36"
        />
        <Input
          placeholder="Pays"
          aria-label="Filtrer par pays"
          value={filters.country}
          onChange={event => setFilter('country', event.target.value)}
          className="lg:w-36"
        />
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
