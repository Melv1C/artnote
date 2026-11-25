import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { ArtworkForm } from '@/features/artworks/components/admin/artwork-form';
import { fetchMyArtworkForEdit } from '@/features/artworks/actions/artwork-queries';
import { Link, createFileRoute } from '@tanstack/react-router';
import { Eye } from 'lucide-react';

export const Route = createFileRoute('/dashboard/artworks/$artworkId/edit')({
  loader: ({ params }) => fetchMyArtworkForEdit({ data: params.artworkId }),
  head: () => ({ meta: [{ title: 'ArtNote - Modifier la notice' }] }),
  component: EditArtworkPage,
});

function EditArtworkPage() {
  const { artworkId } = Route.useParams();
  const artwork = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Modifier la notice"
        description={artwork.title}
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
      <ArtworkForm artwork={artwork} />
    </div>
  );
}
