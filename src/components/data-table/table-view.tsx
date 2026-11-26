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
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  flexRender,
  type CellData,
  type Column,
  type ColumnMeta,
  type RowData,
  type Table as TanStackTable,
  type TableFeatures,
} from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /**
     * Classes for the column's header and cells. `hidden @2xl:table-cell` shows the column only
     * once the table is 42rem wide: container queries, since the sidebar takes part of the screen.
     */
    className?: string;
  }
}

function columnClass<TFeatures extends TableFeatures, TRow extends RowData>(
  column: Column<TFeatures, TRow>,
) {
  // TableView is generic over the features, which leaves the meta's type unresolved here. No
  // table adds feature-specific meta, so it is the `ColumnMeta` declared above.
  return (column.columnDef.meta as ColumnMeta<TFeatures, TRow> | undefined)?.className;
}

interface TableViewProps<TFeatures extends TableFeatures, TRow extends RowData> {
  table: TanStackTable<TFeatures, TRow>;
  /** The table's accessible name, such as "Artistes" */
  label: string;
  isLoading: boolean;
  isError: boolean;
  messages: { empty: string; error: string };
}

/** A dashboard table's rows, or its loading, empty or error state. */
export function TableView<TFeatures extends TableFeatures, TRow extends RowData>({
  table,
  label,
  isLoading,
  isError,
  messages,
}: TableViewProps<TFeatures, TRow>) {
  const columns = table.getAllLeafColumns();

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
    <div
      className="@container overflow-hidden rounded-xl border bg-card shadow-xs"
      aria-busy={isLoading}
    >
      <Table aria-label={label}>
        <TableHeader className="bg-muted/40">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  className={cn(
                    'h-10 px-4 text-xs font-medium text-muted-foreground',
                    columnClass(header.column),
                  )}
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
                {columns.map(column => (
                  <TableCell key={column.id} className={cn('h-14 px-4', columnClass(column))}>
                    <Skeleton className="h-4 w-3/4" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getAllCells().map(cell => (
                  <TableCell key={cell.id} className={cn('h-14 px-4', columnClass(cell.column))}>
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
  );
}

/**
 * "Page 2 sur 5 · 112 au total" (or "· 112 comptes sur 250" for a part of the rows) and, when
 * there is more than one page, Précédent and Suivant. Page 1 of 1 shows only the count.
 */
export function TablePager({
  page,
  pageCount,
  totalCount,
  outOf,
  onPageChange,
}: {
  /** 1-based */
  page: number;
  pageCount: number;
  totalCount: number;
  /** The rows there are in all, named by `noun`, when the table shows only some of them */
  outOf?: { count: number; noun: string };
  onPageChange: (page: number) => void;
}) {
  const count =
    outOf && outOf.count !== totalCount
      ? `${plural(totalCount, outOf.noun)} sur ${outOf.count}`
      : `${totalCount} au total`;
  // Past page 1 the buttons stay, even when the rows now fit on one page (after a delete, say),
  // so the way back is never hidden
  const paged = pageCount > 1 || page > 1;

  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex-1 text-sm text-muted-foreground tabular-nums">
        {totalCount > 0 ? (paged ? `Page ${page} sur ${pageCount} · ${count}` : count) : null}
      </div>
      {paged && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
