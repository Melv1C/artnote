import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Plus } from 'lucide-react';

export function DashboardHeader({ name }: { name: string }) {
  const firstName = name.split(' ')[0];
  return (
    <PageHeader
      title="Tableau de bord"
      description={`Bonjour ${firstName}, voici où en est ArtNote.`}
      actions={
        <Button asChild>
          <Link to="/dashboard/artworks/create">
            <Plus />
            Nouvelle notice
          </Link>
        </Button>
      }
    />
  );
}
