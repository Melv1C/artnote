import { useConfirm } from '@/components/confirm-dialog';
import { DeleteMenuItem, RowMenu } from '@/components/data-table/row-actions';
import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { runMutation } from '@/lib/run-mutation';
import { UserRoleSchema, type UserRole } from '@/schemas/common';
import { IMPERSONATION_SECONDS, SUSPENSION_SECONDS, type User } from '@/schemas/user';
import { formatDuration } from '@/lib/format';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { Ban, ShieldCheck, UserCheck } from 'lucide-react';
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

  const refresh = () =>
    Promise.all([queryClient.invalidateQueries({ queryKey: userKeys.all }), router.invalidate()]);

  const change = (mutate: () => Promise<unknown>, messages: { success: string; failure: string }) =>
    runMutation(async () => {
      await mutate();
      await refresh();
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
    const reason = prompt(
      `Suspension de ${formatDuration(SUSPENSION_SECONDS * 1000)}. Raison (optionnel) :`,
    );
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
      description: `Vous verrez le site comme cette personne, pendant ${formatDuration(IMPERSONATION_SECONDS * 1000)} au plus.`,
      confirmLabel: 'Continuer',
    });
    if (!confirmed) return;
    await runMutation(
      async () => {
        await impersonateUser({ data: user.id });
        window.location.reload();
      },
      { failure: 'La connexion en tant que cet utilisateur a échoué.' },
    );
  };

  return (
    <RowMenu>
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
        <UserCheck />
        Se faire passer pour
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {accountStatus(user) === 'suspended' ? (
        <DropdownMenuItem onClick={handleUnbanUser}>
          <ShieldCheck />
          Lever la suspension
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem onClick={handleBanUser}>
          <Ban />
          Suspendre l’utilisateur
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DeleteMenuItem
        title={`Supprimer le compte de ${user.name} ?`}
        consequence="Le compte et ses sessions sont supprimés."
        confirmLabel="Supprimer le compte"
        onDelete={async () => {
          await deleteUser({ data: user.id });
          await refresh();
        }}
        messages={{
          deleted: 'Utilisateur supprimé',
          failed: 'L’utilisateur n’a pas pu être supprimé.',
        }}
      />
    </RowMenu>
  );
}
