import { AdminDashboard } from '@/features/admin-dashboard/components/admin-dashboard';
import { loadAdminDashboardData } from '@/features/admin-dashboard/actions/dashboard-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/')({
  // Not awaited: each card streams in behind its own Suspense boundary
  loader: () => loadAdminDashboardData(),
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard data={Route.useLoaderData()} />;
}
