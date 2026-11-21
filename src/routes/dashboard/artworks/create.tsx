import { PageHeader } from '@/components/layout/page-header';
import { ArtworkForm } from '@/features/artworks/components/admin/artwork-form';
import { createArtwork } from '@/features/artworks/actions/artwork-mutations';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/artworks/create')({
  component: CreateArtworkPage,
});

function CreateArtworkPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Nouvelle notice"
        description="Un titre suffit pour enregistrer un brouillon ; le reste peut attendre."
      />
      <ArtworkForm
        onSubmit={data => createArtwork({ data })}
        submitLabel="Créer la notice"
        successMessage="Notice créée avec succès !"
      />
    </div>
  );
}
