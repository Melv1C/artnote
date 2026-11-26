import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Painting } from '@/components/painting';
import { formatAgo } from '@/lib/format';
import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { use } from 'react';
import type { fetchMyArtworks } from '../../actions/artwork-queries';
import { mainImage } from '../../lib/artwork-display';
import { StatusBadge } from './status-badge';

/** The writer's most recently changed notices: where to pick the writing back up. */
export function RecentNotices({ artworks }: { artworks: ReturnType<typeof fetchMyArtworks> }) {
  const recent = use(artworks).slice(0, 5);

  return (
    <section aria-labelledby="recent-notices" className="rounded-xl border bg-card shadow-xs">
      <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
        <h2 id="recent-notices" className="font-semibold">
          Reprendre l’écriture
        </h2>
        <Button asChild variant="ghost" size="sm" className="-mr-2 text-primary">
          <Link to="/dashboard/artworks">
            Toutes mes notices
            {/* Kept off phones, where it pushes the heading onto two lines */}
            <ArrowRight aria-hidden="true" className="hidden sm:block" />
          </Link>
        </Button>
      </div>
      {recent.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Vous n’avez pas encore de notice.{' '}
          <Link
            to="/dashboard/artworks/create"
            className="font-medium text-primary hover:underline"
          >
            Créer la première
          </Link>
        </p>
      ) : (
        <ul className="divide-y">
          {recent.map(artwork => (
            <li key={artwork.id}>
              <Link
                to="/dashboard/artworks/$artworkId/edit"
                params={{ artworkId: artwork.id }}
                className="flex items-center gap-4 px-5 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted"
              >
                <Painting
                  image={mainImage(artwork.images)?.image}
                  title={artwork.title}
                  className="size-11 shrink-0 rounded-md p-1"
                  thumbnail
                />
                <div className="min-w-0 flex-1">
                  <p className="work-title text-base leading-snug break-words">{artwork.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Modifiée {formatAgo(artwork.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={artwork.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function RecentNoticesSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5" aria-busy="true">
      <Skeleton className="mb-4 h-5 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="size-11 rounded-md" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  );
}
