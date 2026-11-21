import { useConfirm } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Artist } from '@/schemas/artist';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteArtist } from '../actions/artist-mutations';
import { artistKeys } from '../hooks/use-artists';

export function ArtistRowActions({ artist }: { artist: Artist }) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const fullName = `${artist.firstName} ${artist.lastName}`;

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Supprimer ${fullName} ?`,
      description: 'L’artiste sera retiré des notices qui le citent. Cette action est définitive.',
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteArtist({ data: artist.id });
      await queryClient.invalidateQueries({ queryKey: artistKeys.all });
      toast.success('Artiste supprimé');
    } catch (error) {
      console.error('Deleting artist failed:', error);
      toast.error("Erreur lors de la suppression de l'artiste");
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
          <Link to="/dashboard/artists/$artistId" params={{ artistId: artist.id }}>
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
