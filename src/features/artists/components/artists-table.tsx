import { PagedTable } from '@/components/data-table/paged-table';
import { SearchInput } from '@/components/data-table/search-input';
import { useTableFilters } from '@/components/data-table/use-table-filters';
import { Input } from '@/components/ui/input';
import { useArtists } from '../hooks/use-artists';
import { columns } from './artists-table-columns';

export function ArtistsTable() {
  const { page, setPage, filters, debounced, setFilter } = useTableFilters({
    search: '',
    name: '',
  });
  const { data, isLoading, isError } = useArtists({
    page,
    search: debounced.search || undefined,
    name: debounced.name || undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchInput
          label="Rechercher un artiste"
          value={filters.search}
          onChange={value => setFilter('search', value)}
        />
        <Input
          placeholder="Filtrer par nom"
          aria-label="Filtrer par nom"
          value={filters.name}
          onChange={event => setFilter('name', event.target.value)}
          className="w-48"
        />
      </div>

      <PagedTable
        columns={columns}
        rows={data?.artists ?? []}
        page={data?.pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        isError={isError}
        messages={{
          empty: 'Aucun artiste trouvé.',
          error: 'Erreur lors du chargement des artistes',
        }}
      />
    </div>
  );
}
