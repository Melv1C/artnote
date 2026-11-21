import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dataTableFeatures, type DataTableFeatures } from '@/lib/data-table';
import type { PageInfo } from '@/lib/pagination';
import { flexRender, useTable, type ColumnDef, type RowData } from '@tanstack/react-table';
import { useEffect } from 'react';

interface PagedTableProps<TRow extends RowData> {
  columns: ColumnDef<DataTableFeatures, TRow>[];
  /** The rows of the current page, as the server returned them. */
  rows: TRow[];
  /** The server's page metadata; undefined while the first page loads. */
  page: PageInfo | undefined;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  /** French messages for the empty and error states. */
  messages: { empty: string; error: string };
}

/**
 * A dashboard table over a server-paginated query: the server filters, orders and pages; the
 * table renders one page and moves between pages. It does not sort: a sort over one page would
 * look like a sort over all rows.
 */
export function PagedTable<TRow extends RowData>({
  columns,
  rows,
  page,
  onPageChange,
  isLoading,
  isError,
  messages,
}: PagedTableProps<TRow>) {
  const pageIndex = (page?.page ?? 1) - 1;

  // After deleting the last row of the last page, go back to the new last page
  useEffect(() => {
    if (page && page.totalPages > 0 && page.page > page.totalPages) onPageChange(page.totalPages);
  }, [page, onPageChange]);

  const table = useTable({
    features: dataTableFeatures,
    data: rows,
    columns,
    manualPagination: true,
    rowCount: page?.totalCount ?? 0,
    enableSorting: false,
    state: {
      pagination: { pageIndex, pageSize: page?.limit ?? (rows.length || 1) },
    },
  });

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center text-sm"
      >
        <p className="font-medium text-destructive">{messages.error}</p>
        <p className="mt-1 text-muted-foreground">Rechargez la page dans un instant.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs" aria-busy={isLoading}>
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="h-10 px-4 text-xs font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  {columns.map((_, cell) => (
                    <TableCell key={cell} className="h-14 px-4">
                      <Skeleton className="h-4 w-3/4" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="h-14 px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  {messages.empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="flex-1 text-sm text-muted-foreground tabular-nums">
          {page && page.totalCount > 0
            ? `Page ${page.page} sur ${page.totalPages} · ${page.totalCount} au total`
            : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex)}
            disabled={!page || page.page <= 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pageIndex + 2)}
            disabled={!page?.hasMore}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
