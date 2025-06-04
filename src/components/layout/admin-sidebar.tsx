'use client';

import {
  ArrowLeft,
  BarChart3,
  Database,
  FileText,
  Home,
  Settings,
  Shield,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: Home,
    description: "Vue d'ensemble",
  },
  {
    title: 'Utilisateurs',
    url: '/admin/users',
    icon: Users,
    description: 'Gestion des utilisateurs',
  },
  {
    title: 'Contenu',
    url: '/admin/content',
    icon: FileText,
    description: 'Modération du contenu',
  },
  {
    title: 'Statistiques',
    url: '/admin/analytics',
    icon: BarChart3,
    description: 'Analyses et métriques',
  },
  {
    title: 'Système',
    url: '/admin/settings',
    icon: Settings,
    description: 'Configuration système',
  },
  {
    title: 'Journaux',
    url: '/admin/logs',
    icon: Shield,
    description: 'Logs et sécurité',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Database className="h-8 w-8 text-primary" />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">ArtNote Admin</span>
            <span className="truncate text-xs text-muted-foreground">
              Panneau d'administration
            </span>
          </div>
        </div>
      </SidebarHeader>{' '}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4" />
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        Retour au site
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        Quitter l'administration
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
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
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4 text-xs text-muted-foreground border-t">
          <div className="text-center">ArtNote Administration v1.0</div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
