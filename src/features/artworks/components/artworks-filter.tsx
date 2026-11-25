import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import {
  ArtworkSortSchema,
  DEFAULT_ARTWORK_SORT,
  SortOrderSchema,
  type ArtworkSort,
  type ArtworksSearch,
  type SortOrder,
} from '../lib/artwork-search';
import { ArrowDownUp, MapPin, Search, X } from 'lucide-react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Each sort in both directions, in the order the menu lists them. */
const SORT_LABELS: Record<ArtworkSort, Record<SortOrder, string>> = {
  title: { asc: 'Titre, de A à Z', desc: 'Titre, de Z à A' },
  artist: { asc: 'Artiste, de A à Z', desc: 'Artiste, de Z à A' },
  year: { desc: 'Œuvres les plus récentes', asc: 'Œuvres les plus anciennes' },
  published: { desc: 'Dernières publiées', asc: 'Premières publiées' },
};

const sortValue = ({ sort, order }: { sort: ArtworkSort; order: SortOrder }) => `${sort}-${order}`;

const SORT_OPTIONS = ArtworkSortSchema.options.flatMap(sort =>
  Object.entries(SORT_LABELS[sort]).map(([order, label]) => {
    const option = { sort, order: SortOrderSchema.parse(order) };
    return { ...option, value: sortValue(option), label };
  }),
);

/** Search and sort of the public notices list, kept in the URL so a list can be shared. */
export function ArtworksFilter() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: '/artworks/' });
  const urlSearch = searchParams.search?.toString() ?? '';

  const [search, setSearch] = useState(urlSearch);
  const sortBy = sortValue({
    sort: searchParams.sort ?? DEFAULT_ARTWORK_SORT.sort,
    order: searchParams.order ?? DEFAULT_ARTWORK_SORT.order,
  });
  const debouncedSearch = useDebounce(search);
  const inputRef = useRef<HTMLInputElement>(null);
  // The value this field last wrote to the URL: any other URL value came from elsewhere (a link,
  // back and forward), and the field follows it
  const pushed = useRef(urlSearch);

  const updateURL = useCallback(
    (changes: Pick<ArtworksSearch, 'search' | 'sort' | 'order'>) => {
      void navigate({
        to: '/artworks',
        replace: true,
        resetScroll: false,
        search: prev => ({ ...prev, ...changes }),
      });
    },
    [navigate],
  );

  useEffect(() => {
    if (debouncedSearch === pushed.current) return;
    pushed.current = debouncedSearch;
    updateURL({ search: debouncedSearch || undefined });
  }, [debouncedSearch, updateURL]);

  useEffect(() => {
    if (urlSearch !== pushed.current) {
      pushed.current = urlSearch;
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  const place = searchParams.place?.toString();

  return (
    <div className="space-y-3">
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
            placeholder="Œuvre, artiste, musée…"
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

        <Select
          value={sortBy}
          onValueChange={value => {
            const option = SORT_OPTIONS.find(candidate => candidate.value === value);
            if (option) updateURL({ sort: option.sort, order: option.order });
          }}
        >
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

      {/* From the map's "Voir les N notices": the list is narrowed to a place, and says so */}
      {place && (
        <button
          type="button"
          aria-label={`Retirer le filtre Lieu : ${place}`}
          onClick={() =>
            void navigate({
              to: '/artworks',
              replace: true,
              resetScroll: false,
              search: ({ place: _removed, ...rest }) => rest,
            })
          }
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-input bg-card py-1.5 pr-2 pl-3 text-sm shadow-xs transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <MapPin className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="truncate">
            <span className="text-muted-foreground">Lieu : </span>
            {place}
          </span>
          <X className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
