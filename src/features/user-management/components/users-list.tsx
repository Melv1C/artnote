import { SearchInput } from '@/components/data-table/search-input';
import { TablePager, TableView } from '@/components/data-table/table-view';
import { useTableFilters } from '@/components/data-table/use-table-filters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { plural } from '@/lib/format';
import { useMemo } from 'react';
import { useUsers } from '../hooks/use-users';
import { DEFAULT_USER_FILTER, filterUsers } from '../lib/user-accounts';
import { UserFilters } from './user-filters';
import { useUsersTable } from './users-table';

/**
 * Every account, filtered and sorted in the browser: `fetchUsers` returns at most 100. Past that,
 * move search and paging to the server, as `PagedTable` does for artists and places.
 */
export function UsersList() {
  const { data, isLoading, isError } = useUsers();
  const { page, setPage, filters, debounced, setFilter, reset } =
    useTableFilters(DEFAULT_USER_FILTER);
  const users = useMemo(() => filterUsers(data?.users ?? [], debounced), [data, debounced]);
  const table = useUsersTable(users, page);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tous les comptes</CardTitle>
        <CardDescription>
          {isLoading && 'Chargement des comptes…'}
          {isError && 'Erreur lors du chargement'}
          {data &&
            `${plural(users.length, 'compte')}${users.length !== data.total ? ` sur ${data.total}` : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <SearchInput
            label="Rechercher par nom, email"
            value={filters.search}
            onChange={value => setFilter('search', value)}
          />
          <UserFilters filter={filters} onChange={setFilter} onClear={reset} />
        </div>
        <TableView
          table={table}
          isLoading={isLoading}
          isError={isError}
          messages={{
            empty: 'Aucun compte trouvé.',
            error: 'Erreur lors du chargement des utilisateurs',
          }}
        />
        <TablePager
          page={page}
          pageCount={table.getPageCount()}
          totalCount={users.length}
          onPageChange={setPage}
        />
      </CardContent>
    </Card>
  );
}
