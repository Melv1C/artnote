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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRoleSchema } from '@/schemas';
import { Filter, X } from 'lucide-react';

interface FiltersDropdownProps {
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  emailVerifiedFilter: string;
  onEmailVerifiedFilterChange: (value: string) => void;
  banStatusFilter: string;
  onBanStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function FiltersDropdown({
  roleFilter,
  onRoleFilterChange,
  emailVerifiedFilter,
  onEmailVerifiedFilterChange,
  banStatusFilter,
  onBanStatusFilterChange,
  onClearFilters,
  activeFiltersCount,
}: FiltersDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtres
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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2">
          <label className="text-sm font-medium mb-2 block">Rôle</label>
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value={UserRoleSchema.enum.admin}>Administrateur</SelectItem>
              <SelectItem value={UserRoleSchema.enum.writer}>Rédacteur</SelectItem>
              <SelectItem value={UserRoleSchema.enum.user}>Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-2">
          <label className="text-sm font-medium mb-2 block">
            Email vérifié
          </label>
          <Select
            value={emailVerifiedFilter}
            onValueChange={onEmailVerifiedFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="true">Vérifié</SelectItem>
              <SelectItem value="false">Non vérifié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="p-2">
          <label className="text-sm font-medium mb-2 block">
            Statut du compte
          </label>
          <Select
            value={banStatusFilter}
            onValueChange={onBanStatusFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="banned">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="w-full gap-2"
              >
                <X className="h-4 w-4" />
                Effacer les filtres
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
