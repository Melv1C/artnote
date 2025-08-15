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
import { Place } from '@/schemas/place';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { deletePlace } from '../actions/place-actions';

type PlaceWithRelations = Place & {
  createdBy: { id: string; name: string };
  updatedBy: { id: string; name: string };
  artworks: { id: string; title: string }[];
};

export const columns: ColumnDef<PlaceWithRelations>[] = [
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
    cell: ({ row }) => (
      <Link href={`/dashboard/places/${row.original.id}`} className="font-medium hover:underline">
        {row.getValue('name')}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as string;
      const typeLabels = {
        MUSEUM: 'Musée',
        CHURCH: 'Église',
        PUBLIC_SPACE: 'Espace public',
        OTHER: 'Autre',
      };
      return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
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
      const place = row.original;

      const handleDelete = async () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${place.name}" ?`)) {
          try {
            await deletePlace(place.id);
            toast.success('Lieu supprimé avec succès');
          } catch (error) {
            console.error('Erreur lors de la suppression du lieu:', error);
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
              <Link href={`/dashboard/places/${place.id}`}>
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
