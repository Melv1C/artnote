import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { formatShortDate } from '@/lib/format';
import { DASHBOARD_PAGE_SIZE } from '@/lib/pagination';
import { UserRoleSchema } from '@/schemas/common';
import type { User } from '@/schemas/user';
import {
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type Column,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { ACCOUNT_STATUS_LABELS, accountStatus, USER_ROLE_LABELS } from '../lib/user-accounts';
import { UserRowActions } from './user-row-actions';

const features = tableFeatures({
  rowPaginationFeature,
  rowSortingFeature,
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

type Features = typeof features;

function SortableHeader({ column, label }: { column: Column<Features, User>; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium text-muted-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

const columns: ColumnDef<Features, User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} label="Nom" />,
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <UserAvatar user={row.original} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium">{row.original.name}</span>
            {/* On a phone, the status column is left out: only a suspension shows */}
            {accountStatus(row.original) !== 'active' && (
              <Badge variant="destructive" className="sm:hidden">
                {ACCOUNT_STATUS_LABELS[accountStatus(row.original)]}
              </Badge>
            )}
          </div>
          {/* On a phone, the email column is left out too */}
          <div className="text-xs text-muted-foreground lowercase md:hidden">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => <div className="lowercase">{row.original.email}</div>,
  },
  {
    id: 'role',
    header: 'Rôle',
    meta: { className: 'hidden sm:table-cell' },
    cell: ({ row }) => {
      const role = row.original.role;
      // Quiet badges: colour is kept for what needs attention, a suspension
      return (
        <Badge
          variant="outline"
          className={role === UserRoleSchema.enum.admin ? 'border-primary/30 text-primary' : ''}
        >
          {USER_ROLE_LABELS[role]}
        </Badge>
      );
    },
  },
  {
    id: 'emailVerified',
    header: 'Email vérifié',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) =>
      row.original.emailVerified ? (
        <span className="text-sm">Vérifié</span>
      ) : (
        <span className="text-sm text-muted-foreground">Non vérifié</span>
      ),
  },
  {
    id: 'status',
    header: 'Statut',
    meta: { className: 'hidden sm:table-cell' },
    cell: ({ row }) => {
      const status = accountStatus(row.original);
      return status === 'active' ? (
        <span className="text-sm">{ACCOUNT_STATUS_LABELS.active}</span>
      ) : (
        <Badge variant="destructive">{ACCOUNT_STATUS_LABELS[status]}</Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => <SortableHeader column={column} label="Date d’inscription" />,
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
    meta: { className: 'w-14 text-right' },
    cell: ({ row }) => <UserRowActions user={row.original} />,
  },
];

/** The accounts table: sorted by a column header, one 1-based `page` at a time. */
export function useUsersTable(users: User[], page: number) {
  const [sorting, setSorting] = useState<SortingState>([]);
  return useTable({
    features,
    data: users,
    columns,
    getRowId: user => user.id,
    onSortingChange: setSorting,
    state: { sorting, pagination: { pageIndex: page - 1, pageSize: DASHBOARD_PAGE_SIZE } },
  });
}
