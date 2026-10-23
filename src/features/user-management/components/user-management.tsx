import { UserManagementHeader } from './user-management-header';
import { UserStatsOverview } from './user-stats-overview';
import type { UserStatsData } from '../user-stats-queries';
import { UsersList } from './users-list';

export function UserManagement({ stats }: { stats: UserStatsData }) {
  return (
    <div className="space-y-8">
      <UserManagementHeader />
      <UserStatsOverview data={stats} />
      <UsersList />
    </div>
  );
}
