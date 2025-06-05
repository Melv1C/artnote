import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { getUser } from '@/lib/auth-server';
import { UserRoleSchema } from '@/schemas';
import { unauthorized } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default async function AdminLayout({ children }: PropsWithChildren) {
  // Check if user is authenticated and has admin role
  const user = await getUser();

  if (!user || user.role !== UserRoleSchema.Values.ADMIN) {
    unauthorized();
  }

  return (
    <div className="h-screen">
      <SidebarProvider>
        <AdminSidebar user={user} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Administration ArtNote</h1>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
