import { ChevronsUpDown, Globe, LogOut, UserRound } from 'lucide-react';
import { Link, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

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
import { UserAvatar } from '@/components/user-avatar';
import { useSignOut } from '@/features/auth/hooks/use-sign-out';
import { hasRolePermission } from '@/lib/permissions';
import type { User } from '@/schemas/user';
import { DASHBOARD_HOME, DASHBOARD_NAV } from './dashboard-navigation';

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = useLocation({ select: location => location.pathname });
  const { setOpenMobile } = useSidebar();
  const signOut = useSignOut();

  // On a phone the menu is a drawer: close it once a page is chosen
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="ArtNote">
              <Link to={DASHBOARD_HOME.to}>
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
            <nav aria-label="Gestion">
              <SidebarMenu>
                {DASHBOARD_NAV.filter(item => hasRolePermission(user.role, item.permissions)).map(
                  item => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link
                          to={item.to}
                          activeOptions={{ exact: item.exact }}
                          // SidebarMenuButton styles the current page from `data-active`
                          activeProps={{ 'data-active': true }}
                        >
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </nav>
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
                  <UserAvatar user={user} className="rounded-lg *:rounded-lg" />
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
                <DropdownMenuItem variant="destructive" onClick={signOut}>
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
