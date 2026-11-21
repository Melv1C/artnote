import { DashboardBreadcrumbs } from '@/components/layout/dashboard-breadcrumbs';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { UnauthorizedOrError } from '@/components/layout/unauthorized';
import { ModeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  UNAUTHORIZED_ERROR,
  getDashboardAccess,
  setUnauthorizedStatus,
} from '@/lib/auth-functions';
import { Link, Outlet, createFileRoute } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    // Check if user is authenticated and has permission to view the dashboard
    const { user, canViewDashboard } = await getDashboardAccess();

    if (!user || !canViewDashboard) {
      setUnauthorizedStatus();
      throw new Error(UNAUTHORIZED_ERROR);
    }

    return { user };
  },
  head: () => ({ meta: [{ title: 'ArtNote - Tableau de bord' }] }),
  errorComponent: UnauthorizedOrError,
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl md:rounded-t-xl lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <div className="min-w-0 flex-1">
            <DashboardBreadcrumbs />
          </div>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/">
              Voir le site
              <ArrowUpRight />
            </Link>
          </Button>
          <ModeToggle />
        </header>
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
