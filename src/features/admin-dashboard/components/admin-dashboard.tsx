import { DashboardHeader } from './dashboard-header';
import { StatsOverview } from './stats-overview';

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader />

      {/* Overview Stats */}
      <StatsOverview />
    </div>
  );
}
