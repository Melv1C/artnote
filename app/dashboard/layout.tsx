import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { checkRolePermission } from '@/features/auth';
import { getUser } from '@/lib/auth-server';
import { unauthorized } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Check if user is authenticated and has dashboard access
  const user = await getUser();

  if (!user) {
    unauthorized();
  }

  // Check if user has permission to view dashboard
  const canViewDashboard = await checkRolePermission(user.role, {
    artwork: ['read'],
  });

  if (!canViewDashboard) {
    unauthorized();
  }

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
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
