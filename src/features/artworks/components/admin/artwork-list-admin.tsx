import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { FileText, PlusIcon } from 'lucide-react';
import { use, useMemo, useState } from 'react';
import type { fetchMyArtworks } from '../../actions/artwork-queries';
import {
  ARTWORK_STATUS_VIEWS,
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  filterAdminArtworks,
  inStatusView,
} from '../../lib/admin-artwork-filter';
import { ArtworkFilters } from './artwork-filters';
import { ArtworkRowAdmin, ArtworkTableHeader } from './artwork-row-admin';

/** The writer's notices in the dashboard: status tabs, search, sort and date filters. */
export function ArtworkListAdmin(props: { artworks: ReturnType<typeof fetchMyArtworks> }) {
  const artworks = use(props.artworks);
  const [filters, setFilters] = useState(DEFAULT_ADMIN_ARTWORK_FILTER);
  const debouncedSearch = useDebounce(filters.search);
  const shown = useMemo(
    () => filterAdminArtworks(artworks, { ...filters, search: debouncedSearch }),
    [artworks, filters, debouncedSearch],
  );
  const isFiltered =
    filters.view !== DEFAULT_ADMIN_ARTWORK_FILTER.view ||
    Boolean(filters.search) ||
    countActiveFilters(filters) > 0;

  if (artworks.length === 0) {
    return (
      <EmptyState
        title="Aucune notice créée"
        text="Votre première notice commence par un titre ; le reste peut attendre le brouillon suivant."
        action={
          <Button asChild>
            <Link to="/dashboard/artworks/create">
              <PlusIcon />
              Créer ma première notice
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="inline-flex w-fit flex-wrap rounded-lg bg-muted p-1"
          role="group"
          aria-label="Statut des notices"
        >
          {ARTWORK_STATUS_VIEWS.map(view => {
            const active = filters.view === view.id;
            const count = artworks.filter(a => inStatusView(view.id, a.status)).length;
            return (
              <button
                key={view.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters({ ...filters, view: view.id })}
                className={cn(
                  'inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  active && 'bg-card text-foreground shadow-sm',
                )}
              >
                {view.label}
                <span className="text-xs tabular-nums text-muted-foreground">{count}</span>
              </button>
            );
          })}
        </div>
        <ArtworkFilters filters={filters} onChange={setFilters} />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title="Aucune notice trouvée"
          text="Aucune de vos notices ne correspond à cette recherche ou à ces filtres."
          action={
            <Button variant="outline" onClick={() => setFilters(DEFAULT_ADMIN_ARTWORK_FILTER)}>
              Effacer les filtres
            </Button>
          }
        />
      ) : (
        <div
          role="table"
          aria-label="Mes notices"
          aria-rowcount={shown.length + 1}
          className="@container overflow-hidden rounded-xl border bg-card shadow-xs"
        >
          <ArtworkTableHeader />
          <div role="rowgroup" className="divide-y">
            {shown.map(artwork => (
              <ArtworkRowAdmin key={artwork.id} artwork={artwork} />
            ))}
          </div>
          {isFiltered && (
            <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
              {shown.length} sur {artworks.length} notices
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <FileText className="size-5" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 mb-6 max-w-sm text-muted-foreground">{text}</p>
      {action}
    </div>
  );
}

export function ArtworkListAdminSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement des notices">
      <Skeleton className="h-10 w-80" />
      <div className="divide-y rounded-xl border bg-card">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="size-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
