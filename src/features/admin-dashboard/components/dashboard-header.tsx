import { PageHeader } from '@/components/layout/page-header';

export function DashboardHeader({ name }: { name: string }) {
  const firstName = name.split(' ')[0];
  return (
    <PageHeader
      title="Tableau de bord"
      description={`Bonjour ${firstName}, voici où en est ArtNote.`}
    />
  );
}
