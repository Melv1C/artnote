import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/user-avatar';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
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

// Quiet badges: colour is kept for what needs attention, a suspension
function RoleBadge({ role, className }: { role: User['role']; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        role === UserRoleSchema.enum.admin && 'border-primary/30 text-primary',
        className,
      )}
    >
      {USER_ROLE_LABELS[role]}
    </Badge>
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
            {/* In a narrow table, the role and status columns are left out: only an
                administrator and a suspension show */}
            {row.original.role === UserRoleSchema.enum.admin && (
              <RoleBadge role={row.original.role} className="@lg:hidden" />
            )}
            {accountStatus(row.original) !== 'active' && (
              <Badge variant="destructive" className="@lg:hidden">
                {ACCOUNT_STATUS_LABELS[accountStatus(row.original)]}
              </Badge>
            )}
          </div>
          {/* And the email column */}
          <div className="text-xs text-muted-foreground lowercase @3xl:hidden">
            {row.original.email}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
    meta: { className: 'hidden @3xl:table-cell' },
    cell: ({ row }) => <div className="lowercase">{row.original.email}</div>,
  },
  {
    id: 'role',
    header: 'Rôle',
    meta: { className: 'hidden @lg:table-cell' },
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    id: 'emailVerified',
    header: 'Email vérifié',
    meta: { className: 'hidden @5xl:table-cell' },
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
    meta: { className: 'hidden @lg:table-cell' },
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
    meta: { className: 'hidden @4xl:table-cell' },
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
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
