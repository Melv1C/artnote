'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Filter, SortAsc, X } from 'lucide-react';
import { ArtworkFilter, ArtworkSortOption } from '../../types';

interface ArtworkFiltersDropdownProps {
  filters: ArtworkFilter;
  onFiltersChange: (filters: ArtworkFilter) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

const sortOptions: ArtworkSortOption[] = [
  { value: 'updatedAt', label: 'Dernière modification' },
  { value: 'createdAt', label: 'Date de création' },
  { value: 'title', label: 'Titre' },
  { value: 'viewCount', label: 'Nombre de vues' },
];

export function ArtworkFiltersDropdown({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
}: ArtworkFiltersDropdownProps) {
  const updateFilter = (key: keyof ArtworkFilter, value: string | Date | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres & Tri
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 h-5 w-5 rounded-full p-0 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Filtres et options de tri</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Status Filter */}
        <div className="p-3 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Filter className="h-3 w-3" />
            Statut
          </label>
          <Select
            value={filters.status || 'ALL'}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              <SelectItem value="DRAFT">Brouillon</SelectItem>
              <SelectItem value="PUBLISHED">Publié</SelectItem>
              <SelectItem value="ARCHIVED">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />

        {/* Sort Options */}
        <div className="p-3 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <SortAsc className="h-3 w-3" />
            Trier par
          </label>
          <div className="grid grid-cols-1 gap-2">
            <Select
              value={filters.sortBy || 'updatedAt'}
              onValueChange={(value) => updateFilter('sortBy', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un critère" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value!}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder || 'desc'}
              onValueChange={(value) => updateFilter('sortOrder', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Plus récent d'abord</SelectItem>
                <SelectItem value="asc">Plus ancien d'abord</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Date Range Filters */}
        <div className="p-3 space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-3 w-3" />
            Période de création
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Input
                type="date"
                placeholder="Du"
                value={filters.createdAfter || ''}
                onChange={(e) => updateFilter('createdAfter', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Au"
                value={filters.createdBefore || ''}
                onChange={(e) => updateFilter('createdBefore', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="w-full gap-2 text-muted-foreground"
              >
                <X className="h-4 w-4" />
                Effacer tous les filtres
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
