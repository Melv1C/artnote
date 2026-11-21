import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { initials } from '@/lib/initials';
import { UserRoleSchema } from '@/schemas/common';
import { type User } from '@/schemas/user';
import { type DataTableFeatures } from '@/lib/data-table';
import { type ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { USER_ROLE_LABELS } from '../../lib/user-roles';
import { UserRowActions } from './user-row-actions';

export const columns: ColumnDef<DataTableFeatures, User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Tout sélectionner"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || undefined} alt="" />
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="font-medium">{user.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>,
  },
  {
    accessorKey: 'role',
    header: 'Rôle',
    cell: ({ row }) => {
      const role = row.original.role;
      // Quiet badges: colour is kept for what needs attention, a suspension
      return (
        <Badge
          variant="outline"
          className={role === UserRoleSchema.enum.admin ? 'border-primary/30 text-primary' : ''}
        >
          {USER_ROLE_LABELS[role]}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email vérifié',
    cell: ({ row }) => {
      const isVerified = row.getValue('emailVerified') as boolean;
      return (
        <span className={isVerified ? 'text-sm' : 'text-sm text-muted-foreground'}>
          {isVerified ? 'Vérifié' : 'Non vérifié'}
        </span>
      );
    },
  },
  {
    accessorKey: 'banned',
    header: 'Statut',
    cell: ({ row }) => {
      const user = row.original;
      const isBanned = user.banned;
      const banExpires = user.banExpires;

      if (isBanned) {
        const isExpired = banExpires && new Date(banExpires) < new Date();
        return <Badge variant="destructive">{isExpired ? 'Suspendu (expiré)' : 'Suspendu'}</Badge>;
      }

      return <span className="text-sm">Actif</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date d’inscription
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date;
      return <div>{new Intl.DateTimeFormat('fr-FR').format(date)}</div>;
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;

      return <UserRowActions user={user} />;
    },
  },
];
