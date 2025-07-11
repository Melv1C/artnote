'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useUsersWithSearch } from '../hooks';
import { UsersDataTable, columns } from './users-table';
import { UserActions } from './users-table/user-actions';
import { UsersTableSkeleton } from './users-table/users-table-skeleton';

export function UsersList() {
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('all');
  const [banStatusFilter, setBanStatusFilter] = useState('all');
  const [selectedRowCount, setSelectedRowCount] = useState(0);

  // TODO: When we have more users (>1000), consider implementing:
  // - Server-side search and filtering
  // - Virtual scrolling for table performance
  // - Pagination with proper API endpoints
  // For now, client-side filtering provides better UX for smaller datasets.
  // Debounce search to reduce re-filtering
  const debouncedSearch = useDebounce(searchValue, 300);

  // Fetch users using Better Auth admin plugin
  const { data, isLoading, error, refetch } = useUsersWithSearch();

  const users = data?.users || [];
  const totalCount = data?.pagination.totalCount || 0;

  // Client-side filtering for better UX
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter using debounced search
      const matchesSearch =
        !debouncedSearch.trim() ||
        user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearch.toLowerCase());

      // Role filter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      // Email verified filter
      const matchesEmailVerified =
        emailVerifiedFilter === 'all' ||
        user.emailVerified.toString() === emailVerifiedFilter;

      // Ban status filter
      const matchesBanStatus = (() => {
        if (banStatusFilter === 'all') return true;
        if (banStatusFilter === 'active') return !user.banned;
        if (banStatusFilter === 'banned') return user.banned;
        return true;
      })();

      return (
        matchesSearch && matchesRole && matchesEmailVerified && matchesBanStatus
      );
    });
  }, [
    users,
    debouncedSearch,
    roleFilter,
    emailVerifiedFilter,
    banStatusFilter,
  ]);

  const handleClearFilters = () => {
    setSearchValue('');
    setRoleFilter('all');
    setEmailVerifiedFilter('all');
    setBanStatusFilter('all');
  };

  const handleExportAllUsers = () => {
    toast.warning('Exportation de tous les utilisateurs à venir !', {
      description: `Nous travaillons actuellement sur cette fonctionnalité. ${filteredUsers.length} utilisateurs seraient exportés.`,
    });
  };

  const handleExportSelectedUsers = () => {
    toast.warning('Exportation de la sélection à venir !', {
      description: `Nous travaillons actuellement sur cette fonctionnalité. ${selectedRowCount} utilisateurs sélectionnés seraient exportés.`,
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Gestion des utilisateurs</CardTitle>
            <CardDescription>
              {!isLoading && !error && (
                <>
                  {filteredUsers.length} utilisateur
                  {filteredUsers.length > 1 ? 's' : ''}
                  {filteredUsers.length !== totalCount && ` sur ${totalCount}`}
                </>
              )}
              {isLoading && 'Chargement des utilisateurs...'}
              {error && 'Erreur lors du chargement'}
            </CardDescription>
          </div>
          <UserActions
            selectedCount={selectedRowCount}
            onExportAllUsers={handleExportAllUsers}
            onExportSelectedUsers={handleExportSelectedUsers}
            isLoading={isLoading}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center h-32 gap-4">
            <div className="text-destructive text-center">
              {error instanceof Error
                ? error.message
                : 'Une erreur est survenue'}
            </div>
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        ) : isLoading ? (
          <UsersTableSkeleton />
        ) : (
          <UsersDataTable
            columns={columns}
            data={filteredUsers}
            onSelectionChange={setSelectedRowCount}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            roleFilter={roleFilter}
            onRoleFilterChange={setRoleFilter}
            emailVerifiedFilter={emailVerifiedFilter}
            onEmailVerifiedFilterChange={setEmailVerifiedFilter}
            banStatusFilter={banStatusFilter}
            onBanStatusFilterChange={setBanStatusFilter}
            onClearFilters={handleClearFilters}
          />
        )}
      </CardContent>
    </Card>
  );
}
