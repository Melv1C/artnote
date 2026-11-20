import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import type { Artwork } from '@/schemas/artwork';
import type { ArtworkStatus } from '@/schemas/common';
import { Link } from '@tanstack/react-router';
import { FileText, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  filterAdminArtworks,
  type AdminArtworkFilter,
} from '../../lib/admin-artwork-filter';
import { ArtworkCardWrapper } from './artwork-card-wrapper';
import { ArtworkFilters } from './artwork-filters';

interface ArtworkListAdminProps {
  initialArtworks: Artwork[];
  onDelete: (artworkId: string) => Promise<void>;
  onStatusChange: (artworkId: string, status: ArtworkStatus) => Promise<void>;
}

export function ArtworkListAdmin({
  initialArtworks,
  onDelete,
  onStatusChange,
}: ArtworkListAdminProps) {
  const [filters, setFilters] = useState<AdminArtworkFilter>(DEFAULT_ADMIN_ARTWORK_FILTER);
  const debouncedSearch = useDebounce(filters.search ?? '', 300);
  const artworks = useMemo(
    () => filterAdminArtworks(initialArtworks, { ...filters, search: debouncedSearch }),
    [initialArtworks, filters, debouncedSearch],
  );
  const activeFiltersCount = countActiveFilters(filters);

  return (
    <div>
      {/* Filter controls */}
      <div className="mb-6">
        <ArtworkFilters filters={filters} onFilterChange={setFilters} />
      </div>
      {/* Results summary */}
      {initialArtworks.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {artworks.length === initialArtworks.length ? (
              <>
                {artworks.length} Notice{artworks.length > 1 ? 's' : ''}
              </>
            ) : (
              <>
                {artworks.length} résultat{artworks.length > 1 ? 's' : ''} sur{' '}
                {initialArtworks.length} Notice
                {initialArtworks.length > 1 ? 's' : ''}
              </>
            )}
          </div>
        </div>
      )}
      {/* Content */}
      {artworks.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            {activeFiltersCount > 0 ? 'Aucune notice trouvée' : 'Aucune notice créée'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {activeFiltersCount > 0
              ? "Essayez de modifier vos filtres ou d'effectuer une recherche différente."
              : 'Commencez par créer votre première notice artistique.'}
          </p>
          {activeFiltersCount > 0 ? (
            <Button variant="outline" onClick={() => setFilters(DEFAULT_ADMIN_ARTWORK_FILTER)}>
              Effacer les filtres
            </Button>
          ) : (
            <Button asChild>
              <Link to="/dashboard/artworks/create">
                <PlusIcon className="mr-2 h-4 w-4" />
                Créer ma première notice
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(artwork => (
            <ArtworkCardWrapper
              key={artwork.id}
              artwork={artwork}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ArtworkListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-6 flex justify-between items-center">
        <Skeleton className="h-10 w-[300px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-[220px] w-full" />
          ))}
      </div>
    </div>
  );
}
