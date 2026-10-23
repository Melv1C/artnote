import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Unauthorized } from '@/components/layout/unauthorized';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
  UNAUTHORIZED_ERROR,
  getDashboardAccess,
  setUnauthorizedStatus,
} from '@/lib/auth-functions';
import { ErrorComponent, Outlet, createFileRoute } from '@tanstack/react-router';

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
  errorComponent: ({ error }) =>
    error instanceof Error && error.message === UNAUTHORIZED_ERROR ? (
      <Unauthorized />
    ) : (
      <ErrorComponent error={error} />
    ),
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user } = Route.useRouteContext();

  return (
    <div className="h-screen">
      <SidebarProvider>
        <DashboardSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Tableau de bord</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
