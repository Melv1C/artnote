import { Button } from '@/components/ui/button';
import { type DataTableFeatures } from '@/lib/data-table';
import { type RowData, type Table as TanStackTable } from '@tanstack/react-table';

interface TablePaginationProps<TData extends RowData> {
  table: TanStackTable<DataTableFeatures, TData>;
}

/** "Aucune sélection", "1 compte sélectionné sur 4", "2 comptes sélectionnés sur 4". */
function selectionLabel(selected: number, total: number) {
  if (selected === 0) return `Aucune sélection · ${total} compte${total > 1 ? 's' : ''}`;
  return `${selected} compte${selected > 1 ? 's sélectionnés' : ' sélectionné'} sur ${total}`;
}

export function TablePagination<TData extends RowData>({ table }: TablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectionLabel(
          table.getFilteredSelectedRowModel().rows.length,
          table.getFilteredRowModel().rows.length,
        )}
      </div>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
