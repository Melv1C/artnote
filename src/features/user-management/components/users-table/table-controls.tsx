'use client';

import { FiltersDropdown } from './filters-dropdown';
import { SearchInput } from './search-input';

interface TableControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  emailVerifiedFilter: string;
  onEmailVerifiedFilterChange: (value: string) => void;
  banStatusFilter: string;
  onBanStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

export function TableControls({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  emailVerifiedFilter,
  onEmailVerifiedFilterChange,
  banStatusFilter,
  onBanStatusFilterChange,
  onClearFilters,
}: TableControlsProps) {
  const activeFiltersCount = [
    roleFilter && roleFilter !== 'all',
    emailVerifiedFilter && emailVerifiedFilter !== 'all',
    banStatusFilter && banStatusFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="flex flex-1 gap-2">
        <SearchInput
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Rechercher par nom, email..."
        />

        <FiltersDropdown
          roleFilter={roleFilter}
          onRoleFilterChange={onRoleFilterChange}
          emailVerifiedFilter={emailVerifiedFilter}
          onEmailVerifiedFilterChange={onEmailVerifiedFilterChange}
          banStatusFilter={banStatusFilter}
          onBanStatusFilterChange={onBanStatusFilterChange}
          onClearFilters={onClearFilters}
          activeFiltersCount={activeFiltersCount}
        />
      </div>
    </div>
  );
}
