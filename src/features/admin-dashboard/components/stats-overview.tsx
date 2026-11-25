import { StatCard } from '@/components/stat-card';
import { NotebookPen, Users } from 'lucide-react';
import type { AdminDashboardData } from '../actions/dashboard-queries';
import { AudienceLinkCard } from './audience-link-card';

export function StatsOverview({ data }: { data: AdminDashboardData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="Comptes" icon={Users} data={data.userStats} value={stats => stats.total} />
      <StatCard
        title="Notices publiées"
        icon={NotebookPen}
        tone="success"
        data={data.publishedCount}
        value={count => count}
      />
      <AudienceLinkCard />
    </div>
  );
}
