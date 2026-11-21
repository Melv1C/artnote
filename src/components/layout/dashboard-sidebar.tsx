import {
  ChevronsUpDown,
  FileText,
  Globe,
  LayoutDashboard,
  LogOut,
  MapPin,
  Palette,
  UserRound,
  Users,
} from 'lucide-react';
import { Link, useLocation, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { signOut } from '@/lib/auth-client';
import { initials } from '@/lib/initials';
import { DASHBOARD_PERMISSIONS, hasRolePermission, type PermissionCheck } from '@/lib/permissions';
import type { User } from '@/schemas/user';

const navigationItems = [
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
    permissions: DASHBOARD_PERMISSIONS,
  },
  {
    title: 'Mes notices',
    url: '/dashboard/artworks',
    icon: FileText,
    permissions: DASHBOARD_PERMISSIONS,
  },
  {
    title: 'Artistes',
    url: '/dashboard/artists',
    icon: Palette,
    permissions: DASHBOARD_PERMISSIONS,
  },
  {
    title: 'Lieux',
    url: '/dashboard/places',
    icon: MapPin,
    permissions: DASHBOARD_PERMISSIONS,
  },
  {
    title: 'Utilisateurs',
    url: '/dashboard/users',
    icon: Users,
    permissions: { user: ['list'] },
  },
] satisfies {
  title: string;
  url: string;
  icon: unknown;
  exact?: boolean;
  permissions: PermissionCheck;
}[];

const isActive = (pathname: string, url: string, exact?: boolean) =>
  exact ? pathname.replace(/\/$/, '') === url : pathname === url || pathname.startsWith(`${url}/`);

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = useLocation({ select: location => location.pathname });
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  // On a phone the menu is a drawer: close it once a page is chosen
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  const handleSignOut = async () => {
    try {
      await signOut();
      await router.navigate({ to: '/' });
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('La déconnexion a échoué. Réessayez.');
    }
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="ArtNote">
              <Link to="/dashboard">
                <img
                  src="/logo-96.png"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-lg bg-white ring-1 ring-sidebar-border"
                />
                <span className="grid leading-tight">
                  <span className="font-serif text-lg font-medium">ArtNote</span>
                  <span className="text-xs text-muted-foreground">Rédaction</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems
                .filter(item => hasRolePermission(user.role, item.permissions))
                .map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(pathname, item.url, 'exact' in item && item.exact)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={user.name}
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarImage src={user.image || undefined} alt="" />
                    <AvatarFallback className="rounded-lg bg-accent text-xs font-semibold text-accent-foreground">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="grid min-w-0 flex-1 leading-tight">
                    <span className="truncate text-sm font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </span>
                  <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              >
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserRound />
                    Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/">
                    <Globe />
                    Retour au site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOut />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
