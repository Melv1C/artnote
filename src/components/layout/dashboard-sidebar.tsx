'use client';

import {
  ArrowLeft,
  Database,
  FileText,
  Home,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AdminGate,
  ContentManagerGate,
} from '@/features/auth/components/permission-gate';
import type { User } from '@/schemas/user';

const navigationItems = [
  {
    title: 'Tableau de bord',
    url: '/dashboard',
    icon: Home,
    description: "Vue d'ensemble",
    requiresPermission: null, // Always visible for authenticated users
  },
  {
    title: 'Mes Notices',
    url: '/dashboard/artworks',
    icon: FileText,
    description: 'Gestion des notices',
    requiresPermission: 'contentManager', // Writers and admins
  },
  {
    title: 'Lieux',
    url: '/dashboard/places',
    icon: MapPin,
    description: 'Gestion des lieux',
    requiresPermission: 'contentManager', // Writers and admins
  },
  {
    title: 'Utilisateurs',
    url: '/dashboard/users',
    icon: Users,
    description: 'Gestion des utilisateurs',
    requiresPermission: 'admin', // Admin only
  },
] as const;

export function DashboardSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const { state } = useSidebar();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Database className="h-8 w-8 text-primary" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ArtNote</span>
            <span className="truncate text-xs text-muted-foreground">
              Tableau de bord
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Retour au site">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        Retour au site
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Quitter le tableau de bord
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Gestion</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;

                // Render item based on permission requirements
                const renderItem = () => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium">
                            {item.title}
                          </span>
                          <span className="truncate text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );

                // Apply conditional rendering based on permission requirements
                if (item.requiresPermission === 'admin') {
                  return <AdminGate key={item.title}>{renderItem()}</AdminGate>;
                } else if (item.requiresPermission === 'contentManager') {
                  return (
                    <ContentManagerGate key={item.title}>
                      {renderItem()}
                    </ContentManagerGate>
                  );
                } else {
                  // Always visible for authenticated users
                  return renderItem();
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* User Information */}
        <div className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 shrink-0 cursor-pointer">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name || 'User Avatar'}
                    />
                    <AvatarFallback>
                      {getInitials(user.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  align="center"
                  hidden={state !== 'collapsed'}
                >
                  <div className="text-sm">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 text-xs text-muted-foreground border-t group-data-[collapsible=icon]:hidden">
          <div className="text-center">ArtNote v1.0</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
