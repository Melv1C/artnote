'use client';

import { Badge } from '@/components/ui/badge';
import { UserRoleSchema } from '@/schemas';
import { X } from 'lucide-react';

interface ActiveFiltersProps {
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  emailVerifiedFilter: string;
  onEmailVerifiedFilterChange: (value: string) => void;
}

export function ActiveFilters({
  roleFilter,
  onRoleFilterChange,
  emailVerifiedFilter,
  onEmailVerifiedFilterChange,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    (roleFilter && roleFilter !== 'all') || (emailVerifiedFilter && emailVerifiedFilter !== 'all');

  if (!hasActiveFilters) {
    return null;
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case UserRoleSchema.enum.admin:
        return 'Administrateur';
      case UserRoleSchema.enum.writer:
        return 'Rédacteur';
      case UserRoleSchema.enum.user:
        return 'Utilisateur';
      default:
        return role;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {roleFilter && roleFilter !== 'all' && (
        <Badge variant="secondary" className="gap-1">
          Rôle: {getRoleDisplayName(roleFilter)}
          <button onClick={() => onRoleFilterChange('all')}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
      {emailVerifiedFilter && emailVerifiedFilter !== 'all' && (
        <Badge variant="secondary" className="gap-1">
          Email: {emailVerifiedFilter === 'true' ? 'Vérifié' : 'Non vérifié'}
          <button onClick={() => onEmailVerifiedFilterChange('all')}>
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}
    </div>
  );
}
