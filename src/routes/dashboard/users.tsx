import { UserManagement } from '@/features/user-management/components/user-management';
import { loadUserStats } from '@/features/user-management/actions/user-queries';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/users')({
  // Not awaited: each stat card streams in behind its own Suspense boundary
  loader: () => loadUserStats(),
  head: () => ({ meta: [{ title: 'ArtNote - Utilisateurs' }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  return <UserManagement stats={Route.useLoaderData()} />;
}
