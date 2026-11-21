import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import type { ArtworksSearch } from '../lib/artwork-search';
import { ArrowDownUp, Search, X } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const SORT_OPTIONS = [
  { value: 'title-asc', label: 'Titre, de A à Z' },
  { value: 'title-desc', label: 'Titre, de Z à A' },
  { value: 'artist-asc', label: 'Artiste, de A à Z' },
  { value: 'artist-desc', label: 'Artiste, de Z à A' },
  { value: 'year-desc', label: 'Œuvres les plus récentes' },
  { value: 'year-asc', label: 'Œuvres les plus anciennes' },
  { value: 'published-desc', label: 'Dernières publiées' },
  { value: 'published-asc', label: 'Premières publiées' },
] as const;

/** Search and sort of the public notices list, kept in the URL so a list can be shared. */
export function ArtworksFilter() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/artworks/' });
  const urlSearch = searchParams.search?.toString() ?? '';

  const [search, setSearch] = useState(urlSearch);
  const sortBy = `${searchParams.sort ?? 'title'}-${searchParams.order ?? 'asc'}`;
  const debouncedSearch = useDebounce(search, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  // The value this field last wrote to the URL: any other URL value came from elsewhere (a link,
  // back and forward), and the field follows it
  const pushed = useRef(urlSearch);

  const updateURL = useCallback(
    (newParams: { search?: string; sortBy?: string }) => {
      void navigate({
        to: '/artworks',
        replace: true,
        resetScroll: false,
        search: prev => {
          const params: ArtworksSearch = { ...prev };
          if ('search' in newParams) {
            params.search = newParams.search || undefined;
          }
          if (newParams.sortBy) {
            const [sort, order] = newParams.sortBy.split('-');
            params.sort = sort as ArtworksSearch['sort'];
            params.order = order as ArtworksSearch['order'];
          }
          return params;
        },
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (debouncedSearch === pushed.current) return;
    pushed.current = debouncedSearch;
    updateURL({ search: debouncedSearch });
  }, [debouncedSearch, updateURL]);

  useEffect(() => {
    if (urlSearch !== pushed.current) {
      pushed.current = urlSearch;
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <form
        role="search"
        className="relative flex-1"
        onSubmit={event => {
          event.preventDefault();
          // Close the phone keyboard; the list already follows the typing
          inputRef.current?.blur();
        }}
      >
        <label htmlFor="notice-search" className="sr-only">
          Rechercher une notice
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-[1.1rem] -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id="notice-search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder="Une œuvre, un artiste, un musée…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-12 w-full rounded-full border border-input bg-card pr-12 pl-11 text-base shadow-xs transition-[box-shadow,border-color] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              inputRef.current?.focus();
            }}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Effacer la recherche"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <Select value={sortBy} onValueChange={value => updateURL({ sortBy: value })}>
        <SelectTrigger
          aria-label="Trier les notices"
          className="h-12 w-12 shrink-0 justify-center rounded-full bg-card px-0 max-sm:[&>svg:last-child]:hidden sm:w-60 sm:justify-between sm:px-4 md:h-12"
        >
          <ArrowDownUp className="size-4" aria-hidden="true" />
          <span className="flex-1 text-left max-sm:sr-only">
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent align="end">
          {SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
