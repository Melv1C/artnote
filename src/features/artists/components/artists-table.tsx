import { PagedTable } from '@/components/data-table/paged-table';
import { SearchInput } from '@/components/data-table/search-input';
import { useTableFilters } from '@/components/data-table/use-table-filters';
import { useArtists } from '../hooks/use-artists';
import { columns } from './artists-table-columns';

export function ArtistsTable() {
  const { page, setPage, filters, debounced, setFilter } = useTableFilters({ search: '' });
  const { data, isLoading, isError } = useArtists({
    page,
    search: debounced.search || undefined,
  });

  return (
    <div className="space-y-4">
      <SearchInput
        label="Rechercher un artiste"
        value={filters.search}
        onChange={value => setFilter('search', value)}
      />

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
