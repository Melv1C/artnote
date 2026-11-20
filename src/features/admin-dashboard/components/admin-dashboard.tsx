import type { AdminDashboardData } from '../dashboard-queries';
import { AnalyticsSection } from './analytics';
import { DashboardHeader } from './dashboard-header';
import { StatsOverview } from './stats-overview';

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <DashboardHeader />

      {/* Overview Stats */}
      <StatsOverview data={data.stats} />

      {/* Analytics Section */}
      <AnalyticsSection data={data.analytics} />
    </div>
  );
}
