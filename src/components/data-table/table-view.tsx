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
    /** Classes for the column's header and cells, such as `hidden md:table-cell` to drop it on phones */
    className?: string;
  }
}

function columnClass<TFeatures extends TableFeatures, TRow extends RowData>(
  column: Column<TFeatures, TRow>,
) {
  // Generic over the features, so the meta's type stays unresolved; every table here declares none
  return (column.columnDef.meta as ColumnMeta<TFeatures, TRow> | undefined)?.className;
}

interface TableViewProps<TFeatures extends TableFeatures, TRow extends RowData> {
  table: TanStackTable<TFeatures, TRow>;
  isLoading: boolean;
  isError: boolean;
  messages: { empty: string; error: string };
}

/** A dashboard table's rows, or its loading, empty or error state. */
export function TableView<TFeatures extends TableFeatures, TRow extends RowData>({
  table,
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
    <div className="overflow-hidden rounded-xl border bg-card shadow-xs" aria-busy={isLoading}>
      <Table>
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

/** "Page 2 sur 5 · 112 au total" and, when there is more than one page, Précédent and Suivant. */
export function TablePager({
  page,
  pageCount,
  totalCount,
  onPageChange,
}: {
  /** 1-based */
  page: number;
  pageCount: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="flex-1 text-sm text-muted-foreground tabular-nums">
        {totalCount > 0 ? `Page ${page} sur ${pageCount} · ${totalCount} au total` : null}
      </div>
      {pageCount > 1 && (
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
