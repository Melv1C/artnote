import { DataTableFeatures, dataTableFeatures } from '@/lib/data-table';
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnVisibilityState,
  RowData,
  SortingState,
  useTable,
} from '@tanstack/react-table';
import * as React from 'react';

import { TableContent } from './table-content';
import { TableControls } from './table-controls';
import { TablePagination } from './table-pagination';

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<DataTableFeatures, TData>[];
  data: TData[];
  onSelectionChange?: (count: number) => void;
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

export function UsersDataTable<TData extends RowData>({
  columns,
  data,
  onSelectionChange,
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  emailVerifiedFilter,
  onEmailVerifiedFilterChange,
  banStatusFilter,
  onBanStatusFilterChange,
  onClearFilters,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });
  // Notify parent of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(table.getFilteredSelectedRowModel().rows.length);
    }
  }, [rowSelection, onSelectionChange, table]);

  return (
    <div className="w-full">
      <TableControls
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
        emailVerifiedFilter={emailVerifiedFilter}
        onEmailVerifiedFilterChange={onEmailVerifiedFilterChange}
        banStatusFilter={banStatusFilter}
        onBanStatusFilterChange={onBanStatusFilterChange}
        onClearFilters={onClearFilters}
      />

      <TableContent table={table} columns={columns} />

      <TablePagination table={table} />
    </div>
  );
}
