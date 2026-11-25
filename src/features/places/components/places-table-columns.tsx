import { RowActions } from '@/components/data-table/row-actions';
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
    cell: ({ row }) => (
      <div className="flex flex-wrap items-center gap-2">
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
    ),
  },
  {
    id: 'type',
    header: 'Type',
    cell: ({ row }) => <Badge variant="outline">{PLACE_TYPE_LABELS[row.original.type]}</Badge>,
  },
  {
    id: 'city',
    header: 'Ville',
    cell: ({ row }) => row.original.city || '—',
  },
  {
    id: 'country',
    header: 'Pays',
    cell: ({ row }) => row.original.country || '—',
  },
  {
    id: 'artworks',
    header: 'Œuvres',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {plural(row.original.artworks.length, 'œuvre')}
      </span>
    ),
  },
  {
    id: 'createdAt',
    header: 'Créé le',
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
    cell: ({ row }) => <PlaceRowActions place={row.original} />,
  },
];

function PlaceRowActions({ place }: { place: PlaceWithRelations }) {
  const queryClient = useQueryClient();
  return (
    <RowActions
      editLink={<Link to="/dashboard/places/$placeId" params={{ placeId: place.id }} />}
      name={place.name}
      deleteConsequence="Les notices conservées dans ce lieu n’auront plus de lieu."
      onDelete={async () => {
        await deletePlace({ data: place.id });
        await queryClient.invalidateQueries({ queryKey: placeKeys.all });
      }}
      messages={{ deleted: 'Lieu supprimé', failed: 'Le lieu n’a pas pu être supprimé.' }}
    />
  );
}
