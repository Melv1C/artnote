'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { Artwork } from '@/schemas';
import { FileText, PlusIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { ArtworkActionResponse } from '../../actions/artwork-actions';
import { ArtworkFilter } from '../../types';
import { ArtworkCardWrapper } from './artwork-card-wrapper';
import { ArtworkFilters } from './artwork-filters';

interface ArtworkListAdminProps {
  initialArtworks: Artwork[];
  onDelete: (artworkId: string) => Promise<ArtworkActionResponse>;
  onStatusChange?: (artworkId: string, status: string) => Promise<ArtworkActionResponse>;
}

export function ArtworkListAdmin({
  initialArtworks,
  onDelete,
  onStatusChange,
}: ArtworkListAdminProps) {
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  // Default filters: exclude archived artworks by default
  const [filters, setFilters] = useState<ArtworkFilter>({
    status: ['DRAFT', 'PUBLISHED'], // Default to show only DRAFT and PUBLISHED
  });

  // Debounce search to avoid too many filter operations
  const debouncedSearchTerm = useDebounce(filters.search || '', 300);

  // Apply filters whenever filters change or debounced search changes
  const applyFilters = useCallback(
    (currentFilters: ArtworkFilter, searchTerm: string) => {
      let filteredArtworks = [...initialArtworks];

      // Filter by status
      if (currentFilters.status && currentFilters.status.length > 0) {
        filteredArtworks = filteredArtworks.filter(artwork =>
          currentFilters.status!.includes(artwork.status),
        );
      }

      // Filter by search term (use debounced value)
      if (searchTerm && searchTerm.trim() !== '') {
        const searchLower = searchTerm.toLowerCase();
        filteredArtworks = filteredArtworks.filter(artwork => {
          const titleMatches = artwork.title.toLowerCase().includes(searchLower);
          const mediumMatches = artwork.medium?.toLowerCase().includes(searchLower) || false;
          const yearMatches = artwork.creationYear?.toLowerCase().includes(searchLower) || false;

          return titleMatches || mediumMatches || yearMatches;
        });
      }

      // Filter by date range
      if (currentFilters.createdAfter) {
        const afterDate = new Date(currentFilters.createdAfter);
        filteredArtworks = filteredArtworks.filter(
          artwork => new Date(artwork.createdAt) >= afterDate,
        );
      }

      if (currentFilters.createdBefore) {
        const beforeDate = new Date(currentFilters.createdBefore);
        beforeDate.setHours(23, 59, 59, 999); // End of day
        filteredArtworks = filteredArtworks.filter(
          artwork => new Date(artwork.createdAt) <= beforeDate,
        );
      }

      // Apply sorting
      const sortBy = currentFilters.sortBy || 'updatedAt';
      const sortOrder = currentFilters.sortOrder || 'desc';

      filteredArtworks.sort((a, b) => {
        let aValue: string | Date | number;
        let bValue: string | Date | number;

        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case 'updatedAt':
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
            break;
          case 'viewCount':
            aValue = a.viewCount || 0;
            bValue = b.viewCount || 0;
            break;
          default:
            aValue = new Date(a.updatedAt);
            bValue = new Date(b.updatedAt);
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      setArtworks(filteredArtworks);
    },
    [initialArtworks],
  );

  // Apply filters when debounced search changes
  useEffect(() => {
    applyFilters(filters, debouncedSearchTerm);
  }, [filters, debouncedSearchTerm, applyFilters]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: ArtworkFilter) => {
    setFilters(newFilters);
  }, []);

  // Calculate active filters count
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search') return false;
    if (key === 'sortBy' && value === 'updatedAt') return false;
    if (key === 'sortOrder' && value === 'desc') return false;
    if (key === 'status') {
      // Status filter is active if it's not the default (DRAFT + PUBLISHED)
      const statusArray = value as string[];
      if (!statusArray || statusArray.length === 0) return false;
      return !(
        statusArray.length === 2 &&
        statusArray.includes('DRAFT') &&
        statusArray.includes('PUBLISHED')
      );
    }
    return value !== undefined && value !== null && value !== '';
  }).length;

  return (
    <div>
      {' '}
      {/* Filter controls */}
      <div className="mb-6">
        <ArtworkFilters filters={filters} onFilterChange={handleFilterChange} />
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
            <Button
              variant="outline"
              onClick={() => handleFilterChange({ status: ['DRAFT', 'PUBLISHED'] })}
            >
              Effacer les filtres
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/artworks/create">
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
