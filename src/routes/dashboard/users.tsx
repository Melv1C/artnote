import { PageHeader } from '@/components/layout/page-header';
import { fetchUserStats } from '@/features/user-management/actions/user-queries';
import { UserStatsOverview } from '@/features/user-management/components/user-stats-overview';
import { UsersList } from '@/features/user-management/components/users-list';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/users')({
  // Not awaited: the stat cards stream in behind their skeletons
  loader: () => ({ stats: fetchUserStats() }),
  head: () => ({ meta: [{ title: pageTitle('Utilisateurs') }] }),
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { stats } = Route.useLoaderData();
  return (
    <div className="space-y-8">
      <PageHeader
        title="Utilisateurs"
        description="Les comptes du site : leur rôle, leur accès au tableau de bord, leurs suspensions."
      />
      <UserStatsOverview stats={stats} />
      <UsersList />
    </div>
  );
}
