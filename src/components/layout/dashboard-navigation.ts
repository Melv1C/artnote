import { DASHBOARD_PERMISSIONS, type PermissionCheck } from '@/lib/permissions';
import { FileText, LayoutDashboard, MapPin, Palette, Users, type LucideIcon } from 'lucide-react';

export interface DashboardNavItem {
  label: string;
  to:
    | '/dashboard'
    | '/dashboard/artworks'
    | '/dashboard/artists'
    | '/dashboard/places'
    | '/dashboard/users';
  icon: LucideIcon;
  /** Shown to the roles that have these; the pages check them again on the server */
  permissions: PermissionCheck;
  /** Active only on this exact path, not on the paths below it */
  exact?: boolean;
}

export const DASHBOARD_HOME: DashboardNavItem = {
  label: 'Tableau de bord',
  to: '/dashboard',
  icon: LayoutDashboard,
  permissions: DASHBOARD_PERMISSIONS,
  exact: true,
};

/** The dashboard's sections: the sidebar, and the second step of the breadcrumbs. */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  DASHBOARD_HOME,
  {
    label: 'Mes notices',
    to: '/dashboard/artworks',
    icon: FileText,
    permissions: DASHBOARD_PERMISSIONS,
  },
  {
    label: 'Artistes',
    to: '/dashboard/artists',
    icon: Palette,
    permissions: DASHBOARD_PERMISSIONS,
  },
  { label: 'Lieux', to: '/dashboard/places', icon: MapPin, permissions: DASHBOARD_PERMISSIONS },
  { label: 'Utilisateurs', to: '/dashboard/users', icon: Users, permissions: { user: ['list'] } },
];
