import type { PageInfo } from '@/lib/pagination';
import {
  rowPaginationFeature,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';
import { useEffect } from 'react';
import { TablePager, TableView } from './table-view';

const pagedTableFeatures = tableFeatures({ rowPaginationFeature });

/** The column type of a `PagedTable`. */
export type PagedColumnDef<TRow extends RowData> = ColumnDef<typeof pagedTableFeatures, TRow>;

interface PagedTableProps<TRow extends RowData> {
  columns: PagedColumnDef<TRow>[];
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
  ...view
}: PagedTableProps<TRow>) {
  // After deleting the last row of the last page, go back to the new last page
  useEffect(() => {
    if (page && page.totalPages > 0 && page.page > page.totalPages) onPageChange(page.totalPages);
  }, [page, onPageChange]);

  const table = useTable({
    features: pagedTableFeatures,
    data: rows,
    columns,
    manualPagination: true,
    rowCount: page?.totalCount ?? 0,
    state: {
      pagination: { pageIndex: (page?.page ?? 1) - 1, pageSize: page?.limit ?? (rows.length || 1) },
    },
  });

  return (
    <div className="space-y-4">
      <TableView table={table} {...view} />
      <TablePager
        page={page?.page ?? 1}
        pageCount={page?.totalPages ?? 0}
        totalCount={page?.totalCount ?? 0}
        onPageChange={onPageChange}
      />
    </div>
  );
}
