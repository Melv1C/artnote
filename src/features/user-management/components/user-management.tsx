import { UserManagementHeader } from './user-management-header';
import { UserStatsOverview } from './user-stats-overview';
import { UsersList } from './users-list';

export function UserManagement() {
  return (
    <div className="space-y-8">
      <UserManagementHeader />
      <UserStatsOverview />
      <UsersList />
    </div>
  );
}
