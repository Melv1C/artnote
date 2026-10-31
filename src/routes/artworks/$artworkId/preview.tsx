import { Badge } from '@/components/ui/badge';
import { fetchArtworkPreview } from '@/features/artworks/actions';
import { ArtworkDetail } from '@/features/artworks/components';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/artworks/$artworkId/preview')({
  loader: ({ params }) => fetchArtworkPreview({ data: params.artworkId }),
  component: ArtworkPreviewPage,
});

function ArtworkPreviewPage() {
  const artwork = Route.useLoaderData();

  return (
    <div className="container mx-auto py-6">
      {/* Preview Banner */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300"
          >
            Mode Aperçu
          </Badge>
          <div className="text-sm text-amber-800 dark:text-amber-200">
            Cette notice est en mode aperçu. Elle n'est pas visible publiquement tant qu'elle n'est
            pas publiée.
          </div>
        </div>
        <div className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          Statut actuel :{' '}
          <strong>
            {artwork.status === 'DRAFT'
              ? 'Brouillon'
              : artwork.status === 'ARCHIVED'
                ? 'Archivé'
                : artwork.status}
          </strong>
        </div>
      </div>

      {/* Artwork Content */}
      <ArtworkDetail artwork={artwork} />
    </div>
  );
}
