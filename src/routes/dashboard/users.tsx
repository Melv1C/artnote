import { UserManagement, loadUserStats } from '@/features/user-management';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/users')({
  // Not awaited: each stat card streams in behind its own Suspense boundary
  loader: () => loadUserStats(),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return <UserManagement stats={Route.useLoaderData()} />;
}
