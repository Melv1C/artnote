import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/user-avatar';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { DASHBOARD_PERMISSIONS } from '@/lib/permissions';
import type { User } from '@/schemas/user';
import { useSignOut } from '../hooks/use-sign-out';
import { PermissionGate } from './permission-gate';

export function UserButton({ user }: { user: Pick<User, 'name' | 'email' | 'image'> }) {
  const signOut = useSignOut();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-9 rounded-full p-0"
          aria-label={`Compte de ${user.name}`}
        >
          <UserAvatar user={user} className="size-9 ring-1 ring-border" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound />
            Mon profil
          </Link>
        </DropdownMenuItem>
        <PermissionGate permissions={DASHBOARD_PERMISSIONS}>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <LayoutDashboard />
              Tableau de bord
            </Link>
          </DropdownMenuItem>
        </PermissionGate>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
