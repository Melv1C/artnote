import { PageHeader } from '@/components/layout/page-header';
import { ArtworkForm } from '@/features/artworks/components/admin/artwork-form';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artworks/create')({
  head: () => ({ meta: [{ title: pageTitle('Nouvelle notice') }] }),
  component: CreateArtworkPage,
});

function CreateArtworkPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nouvelle notice"
        description="Un titre suffit pour enregistrer un brouillon ; le reste peut attendre."
      />
      <ArtworkForm />
    </div>
  );
}
