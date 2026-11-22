import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { signOut } from '@/lib/auth-client';
import { initials } from '@/lib/initials';
import { DASHBOARD_PERMISSIONS } from '@/lib/permissions';
import { toast } from 'sonner';
import { PermissionGate } from './permission-gate';

interface UserButtonProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export function UserButton({ user }: UserButtonProps) {
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Vous êtes déconnecté');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('La déconnexion a échoué. Réessayez.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative size-9 rounded-full p-0"
          aria-label={`Compte de ${user.name}`}
        >
          <Avatar className="size-9 ring-1 ring-border">
            <AvatarImage src={user.image || undefined} alt="" />
            <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
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
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
