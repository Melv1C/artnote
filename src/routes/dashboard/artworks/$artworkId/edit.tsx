import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ArtworkForm } from '@/features/artworks/components/admin/artwork-form';
import { updateArtwork } from '@/features/artworks/actions/artwork-mutations';
import { fetchMyArtworkForEdit } from '@/features/artworks/actions/artwork-queries';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Eye } from 'lucide-react';

export const Route = createFileRoute('/dashboard/artworks/$artworkId/edit')({
  loader: ({ params }) => fetchMyArtworkForEdit({ data: params.artworkId }),
  component: EditArtworkPage,
});

function EditArtworkPage() {
  const { artworkId } = Route.useParams();
  const parsed = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Modifier la notice"
        description={parsed.title}
        actions={
          <Button asChild variant="outline">
            <Link to="/artworks/$artworkId/preview" params={{ artworkId }} target="_blank">
              <Eye />
              Aperçu
              <span className="sr-only">(nouvel onglet)</span>
            </Link>
          </Button>
        }
      />
      <ArtworkForm
        initialValues={parsed}
        onSubmit={data => updateArtwork({ data: { artworkId, data } })}
        submitLabel="Mettre à jour"
        successMessage="Notice mise à jour avec succès !"
      />
    </div>
  );
}
