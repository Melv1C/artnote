import { Badge } from '@/components/ui/badge';
import type { PlaceWithRelations } from '@/schemas/place';
import type { DataTableFeatures } from '@/lib/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { PLACE_TYPE_LABELS } from '../lib/place-types';
import { PlaceRowActions } from './place-row-actions';

export const columns: ColumnDef<DataTableFeatures, PlaceWithRelations>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => (
      <Link
        to="/dashboard/places/$placeId"
        params={{ placeId: row.original.id }}
        className="font-medium hover:underline"
      >
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      return <Badge variant="outline">{PLACE_TYPE_LABELS[row.original.type]}</Badge>;
    },
  },
  {
    accessorKey: 'city',
    header: 'Ville',
    cell: ({ row }) => row.getValue('city') || '—',
  },
  {
    accessorKey: 'country',
    header: 'Pays',
    cell: ({ row }) => row.getValue('country') || '—',
  },
  {
    accessorKey: 'artworks',
    header: 'Œuvres',
    cell: ({ row }) => {
      const artworks = row.getValue('artworks') as {
        id: string;
        title: string;
      }[];
      return (
        <span className="text-sm text-muted-foreground">
          {artworks.length} œuvre{artworks.length > 1 ? 's' : ''}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Créé le',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString('fr-FR');
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => <PlaceRowActions place={row.original} />,
  },
];
