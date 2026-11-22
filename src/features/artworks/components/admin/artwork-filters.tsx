import {
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  type AdminArtworkFilter,
} from '../../lib/admin-artwork-filter';
import { ArtworkFiltersDropdown } from '@/features/artworks/components/admin/filters/filters-dropdown';
import { ArtworkSearchInput } from '@/features/artworks/components/admin/filters/search-input';

interface ArtworkFiltersProps {
  filters: AdminArtworkFilter;
  onFilterChange: (filters: AdminArtworkFilter) => void;
}

export function ArtworkFilters({ filters, onFilterChange }: ArtworkFiltersProps) {
  // Handle search input changes
  const handleSearchChange = (search: string) => {
    onFilterChange({
      ...filters,
      search: search || undefined,
    });
  };

  // Handle filter changes from dropdown
  const handleFiltersChange = (newFilters: AdminArtworkFilter) => {
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange(DEFAULT_ADMIN_ARTWORK_FILTER);
  };

  const activeFiltersCount = countActiveFilters(filters);

  return (
    <div className="flex flex-1 gap-2 lg:max-w-xl">
      <ArtworkSearchInput value={filters.search || ''} onChange={handleSearchChange} />
      <ArtworkFiltersDropdown
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
