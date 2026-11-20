import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Place } from '@/schemas/place';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePlace } from '../actions/place-mutations';
import { placeKeys } from '../hooks/use-places';

export function PlaceRowActions({ place }: { place: Place }) {
  const queryClient = useQueryClient();
  const fullName = place.name;

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${fullName}" ?`)) return;
    try {
      await deletePlace({ data: place.id });
      await queryClient.invalidateQueries({ queryKey: placeKeys.all });
      toast.success('Lieu supprimé');
    } catch (error) {
      console.error('Deleting place failed:', error);
      toast.error('Erreur lors de la suppression du lieu');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link to="/dashboard/places/$placeId" params={{ placeId: place.id }}>
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
}
