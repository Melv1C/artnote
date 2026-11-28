import { pageTitle } from '@/lib/seo';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { PlacesTable } from '@/features/places/components/places-table';
import { Plus } from 'lucide-react';
import { Link, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/')({
  head: () => ({ meta: [{ title: pageTitle('Lieux') }] }),
  component: PlacesPage,
});

function PlacesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Lieux"
        description="Les musées, églises et collections où les œuvres sont conservées."
        actions={
          <Button asChild>
            <Link to="/dashboard/places/create">
              <Plus />
              Nouveau lieu
            </Link>
          </Button>
        }
      />
      <PlacesTable />
    </div>
  );
}
