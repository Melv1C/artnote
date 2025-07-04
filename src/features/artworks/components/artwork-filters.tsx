'use client';

import { ArtworkFilter } from '../types';
import { ArtworkFiltersDropdown, ArtworkSearchInput } from './filters';

interface ArtworkFiltersProps {
  filters: ArtworkFilter;
  onFilterChange: (filters: ArtworkFilter) => void;
}

export function ArtworkFilters({
  filters,
  onFilterChange,
}: ArtworkFiltersProps) {
  // Handle search input changes
  const handleSearchChange = (search: string) => {
    onFilterChange({
      ...filters,
      search: search || undefined,
    });
  };

  // Handle filter changes from dropdown
  const handleFiltersChange = (newFilters: ArtworkFilter) => {
    onFilterChange(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    onFilterChange({
      status: ['DRAFT', 'PUBLISHED'], // Reset to default (exclude archived)
    });
  };

  // Count active filters (excluding search and defaults)
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
    <div className="space-y-4">
      {/* Main filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <ArtworkSearchInput
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
          {/* Desktop filters dropdown */}
          <div className="">
            <ArtworkFiltersDropdown
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
