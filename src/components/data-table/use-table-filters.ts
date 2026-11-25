import { useDebounce } from '@/hooks/use-debounce';
import { useState } from 'react';

/**
 * A dashboard table's filters and page. Changing a filter starts again from the first page;
 * `debounced` follows the filters once typing pauses, for the query.
 */
export function useTableFilters<T extends object>(initial: T) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(initial);
  const debounced = useDebounce(filters, 300);

  const setFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters(current => ({ ...current, [key]: value }));
    setPage(1);
  };
  const reset = () => {
    setFilters(initial);
    setPage(1);
  };

  return { page, setPage, filters, debounced, setFilter, reset };
}
