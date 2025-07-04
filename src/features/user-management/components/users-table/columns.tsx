'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/schemas/user';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { UserRowActions } from './user-row-actions';

export const columns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
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
      const role = row.getValue('role') as string;
      const roleLabels = {
        ADMIN: 'Administrateur',
        WRITER: 'Rédacteur',
        VIEWER: 'Lecteur',
      };
      const roleColors = {
        ADMIN: 'destructive',
        WRITER: 'default',
        VIEWER: 'secondary',
      } as const;

      return (
        <Badge variant={roleColors[role as keyof typeof roleColors]}>
          {roleLabels[role as keyof typeof roleLabels] || role}
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
        <Badge variant={isVerified ? 'default' : 'secondary'}>
          {isVerified ? 'Vérifié' : 'Non vérifié'}
        </Badge>
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
        return (
          <Badge variant="destructive">
            {isExpired ? 'Suspendu (expiré)' : 'Suspendu'}
          </Badge>
        );
      }

      return <Badge variant="default">Actif</Badge>;
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
          Date d'inscription
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
