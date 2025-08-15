'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Artist } from '@/schemas/artist';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deleteArtist } from '../actions/artist-actions';

type ArtistWithRelations = Artist & {
  createdBy: { id: string; name: string };
  updatedBy: { id: string; name: string };
  artworks: {
    id: string;
    role: string | null;
    artwork: {
      id: string;
      title: string;
      status: string;
    };
  }[];
};

export const columns: ColumnDef<ArtistWithRelations>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Nom
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const artist = row.original;
      const fullName = `${artist.firstName} ${artist.lastName}`;
      return (
        <Link href={`/dashboard/artists/${artist.id}`} className="font-medium hover:underline">
          {fullName}
        </Link>
      );
    },
  },
  {
    accessorKey: 'birthDate',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Date de naissance
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const birthDate = row.getValue('birthDate') as Date | null;
      return birthDate ? new Date(birthDate).toLocaleDateString('fr-FR') : '—';
    },
  },
  {
    accessorKey: 'deathDate',
    header: 'Date de décès',
    cell: ({ row }) => {
      const deathDate = row.getValue('deathDate') as Date | null;
      return deathDate ? new Date(deathDate).toLocaleDateString('fr-FR') : '—';
    },
  },
  {
    accessorKey: 'artworks',
    header: 'Œuvres',
    cell: ({ row }) => {
      const artworks = row.getValue('artworks') as {
        id: string;
        role: string | null;
        artwork: {
          id: string;
          title: string;
          status: string;
        };
      }[];
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
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Créé le
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      return date.toLocaleDateString('fr-FR');
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const artist = row.original;
      const fullName = `${artist.firstName} ${artist.lastName}`;

      const handleDelete = async () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${fullName}" ?`)) {
          try {
            await deleteArtist(artist.id);
            toast.success('Artiste supprimé avec succès');
          } catch (error) {
            console.error("Erreur lors de la suppression de l'artiste:", error);
            toast.error('Erreur lors de la suppression');
          }
        }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/artists/${artist.id}`}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
