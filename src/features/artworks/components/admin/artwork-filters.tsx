import { SearchInput } from '@/components/data-table/search-input';
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
import {
  ADMIN_ARTWORK_SORT_LABELS,
  ADMIN_ARTWORK_SORTS,
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  type AdminArtworkFilter,
} from '../../lib/admin-artwork-filter';

interface ArtworkFiltersProps {
  filters: AdminArtworkFilter;
  onChange: (filters: AdminArtworkFilter) => void;
}

/** The search box, and a menu for the sort and the creation dates of the writer's notices. */
export function ArtworkFilters({ filters, onChange }: ArtworkFiltersProps) {
  const set = (changes: Partial<AdminArtworkFilter>) => onChange({ ...filters, ...changes });
  const activeCount = countActiveFilters(filters);
  const sortLabels = ADMIN_ARTWORK_SORT_LABELS[filters.sortBy];

  return (
    <div className="flex flex-1 gap-2 @4xl:max-w-xl">
      <SearchInput
        label="Rechercher par titre, technique ou date"
        value={filters.search}
        onChange={search => set({ search })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres et tri
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {activeCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Filtres et options de tri</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <div className="space-y-2 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <SortAsc className="h-3 w-3" />
              Trier par
            </label>
            <div className="grid grid-cols-1 gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={value => {
                  const sortBy = ADMIN_ARTWORK_SORTS.find(sort => sort === value);
                  if (sortBy) set({ sortBy });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir un critère" />
                </SelectTrigger>
                <SelectContent>
                  {ADMIN_ARTWORK_SORTS.map(sort => (
                    <SelectItem key={sort} value={sort}>
                      {ADMIN_ARTWORK_SORT_LABELS[sort].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={value => set({ sortOrder: value === 'asc' ? 'asc' : 'desc' })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">{sortLabels.desc}</SelectItem>
                  <SelectItem value="asc">{sortLabels.asc}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DropdownMenuSeparator />

          <div className="space-y-2 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-3 w-3" />
              Période de création
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                aria-label="Créée à partir du"
                value={filters.createdAfter ?? ''}
                onChange={e => set({ createdAfter: e.target.value || undefined })}
                className="text-xs"
              />
              <Input
                type="date"
                aria-label="Créée jusqu’au"
                value={filters.createdBefore ?? ''}
                onChange={e => set({ createdBefore: e.target.value || undefined })}
                className="text-xs"
              />
            </div>
          </div>

          {activeCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <div className="p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onChange({
                      ...DEFAULT_ADMIN_ARTWORK_FILTER,
                      view: filters.view,
                      search: filters.search,
                    })
                  }
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
    </div>
  );
}
