import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { Artwork } from '@/schemas/artwork';
import type { ArtworkStatus } from '@/schemas/common';
import { Link } from '@tanstack/react-router';
import { FileText, PlusIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  countActiveFilters,
  DEFAULT_ADMIN_ARTWORK_FILTER,
  filterAdminArtworks,
  type AdminArtworkFilter,
} from '../../lib/admin-artwork-filter';
import { ArtworkFilters } from './artwork-filters';
import { ArtworkRowAdmin } from './artwork-row-admin';

interface ArtworkListAdminProps {
  initialArtworks: Artwork[];
  onDelete: (artworkId: string) => Promise<void>;
  onStatusChange: (artworkId: string, status: ArtworkStatus) => Promise<void>;
}

/** The status views above the list; "En cours" is the default, archives set aside. */
const STATUS_VIEWS: { label: string; status: ArtworkStatus[] }[] = [
  { label: 'En cours', status: ['DRAFT', 'PUBLISHED'] },
  { label: 'Brouillons', status: ['DRAFT'] },
  { label: 'Publiées', status: ['PUBLISHED'] },
  { label: 'Archivées', status: ['ARCHIVED'] },
];

const sameStatuses = (a: ArtworkStatus[] = [], b: ArtworkStatus[]) =>
  a.length === b.length && b.every(status => a.includes(status));

export function ArtworkListAdmin({
  initialArtworks,
  onDelete,
  onStatusChange,
}: ArtworkListAdminProps) {
  const [filters, setFilters] = useState<AdminArtworkFilter>(DEFAULT_ADMIN_ARTWORK_FILTER);
  const debouncedSearch = useDebounce(filters.search ?? '', 300);
  const artworks = useMemo(
    () => filterAdminArtworks(initialArtworks, { ...filters, search: debouncedSearch }),
    [initialArtworks, filters, debouncedSearch],
  );
  const isFiltered = countActiveFilters(filters) > 0 || Boolean(filters.search);

  if (initialArtworks.length === 0) {
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
          {STATUS_VIEWS.map(view => {
            const active = sameStatuses(filters.status, view.status);
            const count = initialArtworks.filter(a => view.status.includes(a.status)).length;
            return (
              <button
                key={view.label}
                type="button"
                aria-pressed={active}
                onClick={() => setFilters({ ...filters, status: view.status })}
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
        <ArtworkFilters filters={filters} onFilterChange={setFilters} />
      </div>

      {artworks.length === 0 ? (
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
        <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
          <div
            className="hidden grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_4.5rem] gap-x-4 lg:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_10.5rem] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid"
            aria-hidden="true"
          >
            <span />
            <span>Notice</span>
            <span>Statut</span>
            <span>Modifiée</span>
            <span className="text-right">Vues</span>
            <span />
          </div>
          <ul className="divide-y" aria-label={`${artworks.length} notices`}>
            {artworks.map(artwork => (
              <ArtworkRowAdmin
                key={artwork.id}
                artwork={artwork}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
              />
            ))}
          </ul>
          {isFiltered && (
            <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
              {artworks.length} sur {initialArtworks.length} notices
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

export function ArtworkListSkeleton() {
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
