import { useConfirm } from '@/components/confirm-dialog';
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
import { runMutation } from '@/lib/run-mutation';
import { UserRoleSchema, type UserRole } from '@/schemas/common';
import type { User } from '@/schemas/user';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Ban, MoreHorizontal, ShieldCheck, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import {
  banUser,
  deleteUser,
  impersonateUser,
  unbanUser,
  updateUserRole,
} from '../actions/user-mutations';
import { userKeys } from '../hooks/use-users';
import { accountStatus, USER_ROLE_LABELS } from '../lib/user-accounts';

export function UserRowActions({ user }: { user: User }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const confirm = useConfirm();

  /** Run a change to the account, then refresh the list and the page's figures. */
  const change = (mutate: () => Promise<unknown>, messages: { success: string; failure: string }) =>
    runMutation(async () => {
      await mutate();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.all }),
        router.invalidate(),
      ]);
    }, messages);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      toast.success('ID utilisateur copié dans le presse-papiers', {
        description: `ID: ${user.id}`,
      });
    } catch (error) {
      console.error('Copying user id failed:', error);
      toast.error('Impossible de copier l’ID');
    }
  };

  const handleEditRole = (role: UserRole) =>
    change(() => updateUserRole({ data: { userId: user.id, role } }), {
      success: `Rôle mis à jour vers ${USER_ROLE_LABELS[role]}`,
      failure: 'Le rôle n’a pas pu être modifié.',
    });

  const handleBanUser = async () => {
    const reason = prompt('Raison de la suspension (optionnel):');
    if (reason === null) return;
    await change(() => banUser({ data: { userId: user.id, banReason: reason || undefined } }), {
      success: 'Utilisateur suspendu',
      failure: 'L’utilisateur n’a pas pu être suspendu.',
    });
  };

  const handleUnbanUser = () =>
    change(() => unbanUser({ data: { userId: user.id } }), {
      success: 'Suspension levée',
      failure: 'La suspension n’a pas pu être levée.',
    });

  const handleImpersonateUser = async () => {
    const confirmed = await confirm({
      title: `Se connecter en tant que ${user.name} ?`,
      description: 'Vous verrez le site comme cette personne, pendant une heure au plus.',
      confirmLabel: 'Continuer',
    });
    if (!confirmed) return;
    // The whole page reloads with the new session
    await runMutation(
      async () => {
        await impersonateUser({ data: user.id });
        window.location.reload();
      },
      { failure: 'La connexion en tant que cet utilisateur a échoué.' },
    );
  };

  const handleDeleteUser = async () => {
    const confirmed = await confirm({
      title: `Supprimer le compte de ${user.name} ?`,
      description: 'Le compte et ses sessions sont supprimés. Cette action est définitive.',
      confirmLabel: 'Supprimer le compte',
      destructive: true,
    });
    if (!confirmed) return;
    await change(() => deleteUser({ data: user.id }), {
      success: 'Utilisateur supprimé',
      failure: 'L’utilisateur n’a pas pu être supprimé.',
    });
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
        <DropdownMenuItem onClick={handleCopyId}>Copier l’ID utilisateur</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Modifier le rôle</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {UserRoleSchema.options.map(role => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleEditRole(role)}
                  disabled={user.role === role}
                >
                  {USER_ROLE_LABELS[role]}
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
        {accountStatus(user) === 'suspended' ? (
          <DropdownMenuItem onClick={handleUnbanUser}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Lever la suspension
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleBanUser}>
            <Ban className="mr-2 h-4 w-4" />
            Suspendre l’utilisateur
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDeleteUser}>
          Supprimer l’utilisateur
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
