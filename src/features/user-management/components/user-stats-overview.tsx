import { StatCard } from '@/components/stat-card';
import { plural } from '@/lib/format';
import { Activity, Shield, Users } from 'lucide-react';
import type { fetchUserStats } from '../actions/user-queries';

export function UserStatsOverview({ stats }: { stats: ReturnType<typeof fetchUserStats> }) {
  return (
    <div className="grid gap-4 @xl:grid-cols-3">
      <StatCard title="Comptes" icon={Users} data={stats} value={s => s.total} />
      <StatCard title="Administrateurs" icon={Shield} data={stats} value={s => s.admins} />
      <StatCard
        title="Nouveaux cette semaine"
        icon={Activity}
        data={stats}
        value={s => s.newThisWeek}
        // A percentage means nothing against an empty week: give last week's count instead
        subtitle={s =>
          s.newLastWeek === 0
            ? 'Aucune inscription la semaine dernière'
            : `${plural(s.newLastWeek, 'inscription')} la semaine dernière`
        }
      />
    </div>
  );
}
