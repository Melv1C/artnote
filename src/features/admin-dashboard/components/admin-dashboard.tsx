import type { AdminDashboardData } from '../actions/dashboard-queries';
import { DashboardHeader } from './dashboard-header';
import { StatsOverview } from './stats-overview';

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <StatsOverview data={data.stats} />
    </div>
  );
}
