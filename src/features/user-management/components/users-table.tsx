import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { formatShortDate } from '@/lib/format';
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

const PAGE_SIZE = 10;

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
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

const columns: ColumnDef<Features, User>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <SortableHeader column={column} label="Nom" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <UserAvatar user={row.original} />
        <div className="font-medium">{row.original.name}</div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
    cell: ({ row }) => <div className="lowercase">{row.original.email}</div>,
  },
  {
    id: 'role',
    header: 'Rôle',
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
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
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
    state: { sorting, pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE } },
  });
}
