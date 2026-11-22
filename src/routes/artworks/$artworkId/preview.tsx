import { NotFound } from '@/components/layout/not-found';
import { UnauthorizedOrError } from '@/components/layout/unauthorized';
import { Button } from '@/components/ui/button';
import { fetchArtworkPreview } from '@/features/artworks/actions/artwork-queries';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ArtworkDetail } from '@/features/artworks/components/artwork-detail';
import { ARTWORK_STATUS_LABELS } from '@/features/artworks/lib/artwork-status';
import { Link, createFileRoute } from '@tanstack/react-router';
import { EyeOff, Pencil } from 'lucide-react';

export const Route = createFileRoute('/artworks/$artworkId/preview')({
  loader: ({ params }) => fetchArtworkPreview({ data: params.artworkId }),
  component: ArtworkPreviewPage,
  errorComponent: UnauthorizedOrError,
  notFoundComponent: NotFound,
});

function ArtworkPreviewPage() {
  const artwork = Route.useLoaderData();
  const isPublished = artwork.status === 'PUBLISHED';
  const { user } = useAuth();
  // Only the writer can edit a notice (ADR 0003); other admins only preview it
  const isOwn = user?.id === artwork.writer.id;

  return (
    <>
      {/* Says, before anything else, that readers may not see this page */}
      <div className="border-b border-warning/40 bg-[color-mix(in_oklab,var(--warning)_16%,var(--background))]">
        <div className="page-width flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2.5">
          <p className="flex items-center gap-2 text-sm">
            <EyeOff className="size-4 shrink-0" aria-hidden="true" />
            <span>
              <strong className="font-semibold">Mode Aperçu</strong>
              <span className="text-muted-foreground">
                {' '}
                · {ARTWORK_STATUS_LABELS[artwork.status]}
                {isPublished ? ', visible par les lecteurs' : ', invisible pour les lecteurs'}
              </span>
            </span>
          </p>
          {isOwn && (
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link to="/dashboard/artworks/$artworkId/edit" params={{ artworkId: artwork.id }}>
                <Pencil />
                Modifier
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="pt-4">
        <ArtworkDetail artwork={artwork} preview />
      </div>
    </>
  );
}
