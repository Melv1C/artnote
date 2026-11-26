import { DeleteMenuItem, EditMenuItem, RowMenu } from '@/components/data-table/row-actions';
import type { PagedColumnDef } from '@/components/data-table/paged-table';
import { Badge } from '@/components/ui/badge';
import { formatShortDate, plural } from '@/lib/format';
import type { PlaceWithRelations } from '@/schemas/place';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { deletePlace } from '../actions/place-mutations';
import { placeKeys } from '../hooks/use-places';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

export const columns: PagedColumnDef<PlaceWithRelations>[] = [
  {
    id: 'name',
    header: 'Nom',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => (
      <div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to="/dashboard/places/$placeId"
            params={{ placeId: row.original.id }}
            className="font-medium hover:underline"
          >
            {row.original.name}
          </Link>
          {(row.original.latitude === null || row.original.longitude === null) && (
            <Badge variant="secondary">Sans position</Badge>
          )}
        </div>
        {/* On a phone, the columns left out of the table */}
        <p className="text-xs text-muted-foreground md:hidden">
          {[PLACE_TYPE_LABELS[row.original.type], row.original.city].filter(Boolean).join(' · ')}
        </p>
      </div>
    ),
  },
  {
    id: 'type',
    header: 'Type',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => <Badge variant="outline">{PLACE_TYPE_LABELS[row.original.type]}</Badge>,
  },
  {
    id: 'city',
    header: 'Ville',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => row.original.city || '—',
  },
  {
    id: 'country',
    header: 'Pays',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => row.original.country || '—',
  },
  {
    id: 'artworks',
    header: 'Œuvres',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {plural(row.original.artworks.length, 'œuvre')}
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Créé le',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
    meta: { className: 'w-14 text-right' },
    cell: ({ row }) => <PlaceRowActions place={row.original} />,
  },
];

function PlaceRowActions({ place }: { place: PlaceWithRelations }) {
  const queryClient = useQueryClient();
  return (
    <RowMenu>
      <EditMenuItem
        link={<Link to="/dashboard/places/$placeId" params={{ placeId: place.id }} />}
      />
      <DeleteMenuItem
        title={`Supprimer ${place.name} ?`}
        consequence="Les notices conservées dans ce lieu n’auront plus de lieu."
        onDelete={async () => {
          await deletePlace({ data: place.id });
          await queryClient.invalidateQueries({ queryKey: placeKeys.all });
        }}
        messages={{ deleted: 'Lieu supprimé', failed: 'Le lieu n’a pas pu être supprimé.' }}
      />
    </RowMenu>
  );
}
