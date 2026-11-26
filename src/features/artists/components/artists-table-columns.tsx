import { DeleteMenuItem, EditMenuItem, RowMenu } from '@/components/data-table/row-actions';
import type { PagedColumnDef } from '@/components/data-table/paged-table';
import { Badge } from '@/components/ui/badge';
import { artistFullName } from '@/features/artists/lib/artist-name';
import { formatShortDate, plural } from '@/lib/format';
import type { ArtistWithRelations } from '@/schemas/artist';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { deleteArtist } from '../actions/artist-mutations';
import { artistKeys } from '../hooks/use-artists';

export const columns: PagedColumnDef<ArtistWithRelations>[] = [
  {
    id: 'name',
    header: 'Nom',
    meta: { className: 'whitespace-normal' },
    cell: ({ row }) => (
      <div>
        <Link
          to="/dashboard/artists/$artistId"
          params={{ artistId: row.original.id }}
          className="font-medium hover:underline"
        >
          {artistFullName(row.original)}
        </Link>
        {/* In a narrow table, the works column is left out */}
        <p className="text-xs text-muted-foreground @3xl:hidden">
          {plural(row.original.artworks.length, 'œuvre')}
        </p>
      </div>
    ),
  },
  {
    id: 'birthDate',
    header: 'Date de naissance',
    meta: { className: 'hidden @2xl:table-cell' },
    cell: ({ row }) => row.original.birthDate ?? '—',
  },
  {
    id: 'deathDate',
    header: 'Date de décès',
    meta: { className: 'hidden @2xl:table-cell' },
    cell: ({ row }) => row.original.deathDate ?? '—',
  },
  {
    id: 'artworks',
    header: 'Œuvres',
    meta: { className: 'hidden @3xl:table-cell whitespace-normal' },
    cell: ({ row }) => {
      const artworks = row.original.artworks;
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">{plural(artworks.length, 'œuvre')}</span>
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
    id: 'createdAt',
    header: 'Créé le',
    meta: { className: 'hidden @4xl:table-cell' },
    cell: ({ row }) => formatShortDate(row.original.createdAt),
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    meta: { className: 'w-14 text-right' },
    cell: ({ row }) => <ArtistRowActions artist={row.original} />,
  },
];

function ArtistRowActions({ artist }: { artist: ArtistWithRelations }) {
  const queryClient = useQueryClient();
  return (
    <RowMenu>
      <EditMenuItem
        link={<Link to="/dashboard/artists/$artistId" params={{ artistId: artist.id }} />}
      />
      <DeleteMenuItem
        title={`Supprimer ${artistFullName(artist)} ?`}
        consequence="L’artiste sera retiré des notices qui le citent."
        onDelete={async () => {
          await deleteArtist({ data: artist.id });
          await queryClient.invalidateQueries({ queryKey: artistKeys.all });
        }}
        messages={{ deleted: 'Artiste supprimé', failed: 'L’artiste n’a pas pu être supprimé.' }}
      />
    </RowMenu>
  );
}
