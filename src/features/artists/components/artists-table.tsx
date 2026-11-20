import { PagedTable } from '@/components/data-table/paged-table';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useArtists } from '../hooks/use-artists';
import { columns } from './artists-table-columns';

export function ArtistsTable() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', name: '', bornAfter: '', bornBefore: '' });
  const debounced = useDebounce(filters, 300);

  const { data, isLoading, isError } = useArtists({
    page,
    search: debounced.search || undefined,
    name: debounced.name || undefined,
    bornAfter: debounced.bornAfter || undefined,
    bornBefore: debounced.bornBefore || undefined,
  });

  // A new filter starts again from the first page
  const setFilter = (key: keyof typeof filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(current => ({ ...current, [key]: event.target.value }));
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un artiste..."
            value={filters.search}
            onChange={setFilter('search')}
            className="pl-10"
          />
        </div>
        <Input
          placeholder="Nom"
          value={filters.name}
          onChange={setFilter('name')}
          className="w-48"
        />
        <Input
          placeholder="Né après"
          type="date"
          value={filters.bornAfter}
          onChange={setFilter('bornAfter')}
          className="w-48"
        />
        <Input
          placeholder="Né avant"
          type="date"
          value={filters.bornBefore}
          onChange={setFilter('bornBefore')}
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
