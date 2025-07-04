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
import { Ban, MoreHorizontal, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  banUser,
  deleteUser,
  impersonateUser,
  unbanUser,
  updateUserRole,
} from '../../actions/user-actions';

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
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleBanUser = async () => {
    const reason = prompt('Raison de la suspension (optionnel):');
    if (reason === null) return; // User cancelled

    try {
      await banUser({
        userId: user.id,
        banReason: reason || undefined,
      });
      toast.success('Utilisateur suspendu avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error("Erreur lors de la suspension de l'utilisateur");
    }
  };

  const handleUnbanUser = async () => {
    try {
      await unbanUser({ userId: user.id });
      toast.success('Suspension levée avec succès');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error('Erreur lors de la levée de suspension');
    }
  };

  const handleImpersonateUser = async () => {
    if (
      confirm(`Êtes-vous sûr de vouloir vous faire passer pour ${user.name} ?`)
    ) {
      try {
        await impersonateUser(user.id);
        toast.success(`Vous vous faites maintenant passer pour ${user.name}`, {
          description: 'Cette session durera 1 heure maximum',
        });
        // Refresh the page to update the session
        window.location.reload();
      } catch (error) {
        console.error('Error impersonating user:', error);
        toast.error("Erreur lors de l'impersonation");
      }
    }
  };

  const handleDeleteUser = async () => {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)
    ) {
      try {
        await deleteUser(user.id);
        toast.success('Utilisateur supprimé avec succès');
        queryClient.invalidateQueries({ queryKey: ['users'] });
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  const isBanned = user.banned;
  const banExpired = user.banExpires && new Date(user.banExpires) < new Date();

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
        <DropdownMenuSeparator />
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
        <DropdownMenuItem onClick={handleImpersonateUser}>
          <UserCheck className="mr-2 h-4 w-4" />
          Se faire passer pour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isBanned && !banExpired ? (
          <DropdownMenuItem onClick={handleUnbanUser}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Lever la suspension
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleBanUser}>
            <Ban className="mr-2 h-4 w-4" />
            Suspendre l'utilisateur
          </DropdownMenuItem>
        )}
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
