'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserRole, UserRoleSchema } from '@/schemas';
import { User } from '@/schemas/user';
import { useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { deleteUser, updateUserRole } from '../../actions/user-actions';

interface UserRowActionsProps {
  user: User;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  // Get query client for invalidation
  const queryClient = useQueryClient();
  // Helper function to get user-friendly role names
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'WRITER':
        return 'Rédacteur';
      case 'VIEWER':
        return 'Lecteur';
      default:
        return role;
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    toast.success('ID utilisateur copié dans le presse-papiers', {
      description: `ID: ${user.id}`,
    });
  };
  const handleViewProfile = () => {
    // TODO: Navigate to user profile view
    toast.info('Fonctionnalité en cours de développement');
  };

  const handleEditRole = async (newRole: UserRole) => {
    try {
      await updateUserRole(user.id, newRole);
      toast.success(`Rôle mis à jour vers ${getRoleDisplayName(newRole)}`);
      queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate users query to refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async () => {
    // Show confirmation dialog before deletion
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)
    ) {
      try {
        await deleteUser(user.id);
        toast.success('Utilisateur supprimé avec succès');
        queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate users query to refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Erreur lors de la suppression de l'utilisateur");
      }
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyId}>
          Copier l'ID utilisateur
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewProfile}>
          Voir le profil
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Modifier le rôle</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {UserRoleSchema.options.map((role) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleEditRole(role)}
                  disabled={user.role === role}
                >
                  {getRoleDisplayName(role)}
                  {user.role === role && ' (actuel)'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive"
          onClick={handleDeleteUser}
        >
          Supprimer l'utilisateur
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
