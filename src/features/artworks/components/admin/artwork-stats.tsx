import { StatCard } from '@/components/stat-card';
import { Eye, FileText, NotebookPen, PencilLine } from 'lucide-react';
import type { fetchMyArtworkStats } from '../../actions/artwork-queries';
import { ARTWORK_STATUS } from '../../lib/artwork-status';

export function ArtworkStats({ stats }: { stats: ReturnType<typeof fetchMyArtworkStats> }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard title="Notices" icon={FileText} data={stats} value={s => s.total} />
      <StatCard
        title={ARTWORK_STATUS.PUBLISHED.plural}
        icon={NotebookPen}
        tone="success"
        data={stats}
        value={s => s.published}
      />
      <StatCard
        title={ARTWORK_STATUS.DRAFT.plural}
        icon={PencilLine}
        tone="warning"
        data={stats}
        value={s => s.drafts}
      />
      <StatCard title="Vues" icon={Eye} data={stats} value={s => s.views} />
    </div>
  );
}
