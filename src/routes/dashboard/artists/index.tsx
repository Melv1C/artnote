import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ArtistsTable } from '@/features/artists/components/artists-table';
import { Plus } from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artists/')({
  component: ArtistsPage,
});

function ArtistsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Artistes"
        description="Les artistes que les notices citent, avec leurs dates."
        actions={
          <Button asChild>
            <Link to="/dashboard/artists/create">
              <Plus />
              Nouvel artiste
            </Link>
          </Button>
        }
      />
      <ArtistsTable />
    </div>
  );
}
