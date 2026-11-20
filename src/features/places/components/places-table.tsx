import { PagedTable } from '@/components/data-table/paged-table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { PlaceTypeSchema } from '@/schemas/common';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { usePlaces } from '../hooks/use-places';
import { PLACE_TYPE_LABELS } from '../lib/place-types';
import { columns } from './places-table-columns';

export function PlacesTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', type: 'all', city: '', country: '' });
  const debounced = useDebounce(filters, 300);

  const { data, isLoading, isError } = usePlaces({
    page,
    search: debounced.search || undefined,
    type: PlaceTypeSchema.safeParse(debounced.type).data,
    city: debounced.city || undefined,
    country: debounced.country || undefined,
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
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un lieu..."
            value={filters.search}
            onChange={event => setFilter('search', event.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filters.type} onValueChange={value => setFilter('type', value)}>
          <SelectTrigger className="w-48">
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
          value={filters.city}
          onChange={event => setFilter('city', event.target.value)}
          className="w-32"
        />
        <Input
          placeholder="Pays"
          value={filters.country}
          onChange={event => setFilter('country', event.target.value)}
          className="w-32"
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
