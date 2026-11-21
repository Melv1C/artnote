import { Badge } from '@/components/ui/badge';
import type { ArtistWithRelations } from '@/schemas/artist';
import type { DataTableFeatures } from '@/lib/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';
import { ArtistRowActions } from './artist-row-actions';

export const columns: ColumnDef<DataTableFeatures, ArtistWithRelations>[] = [
  {
    accessorKey: 'name',
    header: 'Nom',
    cell: ({ row }) => {
      const artist = row.original;
      const fullName = `${artist.firstName} ${artist.lastName}`;
      return (
        <Link
          to="/dashboard/artists/$artistId"
          params={{ artistId: artist.id }}
          className="font-medium hover:underline"
        >
          {fullName}
        </Link>
      );
    },
  },
  {
    accessorKey: 'birthDate',
    header: 'Date de naissance',
    cell: ({ row }) => row.original.birthDate ?? '—',
  },
  {
    accessorKey: 'deathDate',
    header: 'Date de décès',
    cell: ({ row }) => row.original.deathDate ?? '—',
  },
  {
    accessorKey: 'artworks',
    header: 'Œuvres',
    cell: ({ row }) => {
      const artworks = row.original.artworks;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {artworks.length} œuvre{artworks.length > 1 ? 's' : ''}
          </span>
          {artworks.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {artworks.slice(0, 3).map(artwork => (
                <Badge key={artwork.id} variant="outline" className="text-xs">
                  {artwork.artwork.title}
                </Badge>
              ))}
              {artworks.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{artworks.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
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
    cell: ({ row }) => <ArtistRowActions artist={row.original} />,
  },
];
