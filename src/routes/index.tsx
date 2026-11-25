import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchLatestPublishedArtworks } from '@/features/artworks/actions/artwork-queries';
import { ArtworkCard } from '@/features/artworks/components/artwork-card';
import { Painting } from '@/components/painting';
import { cartelLine, mainImage } from '@/features/artworks/lib/artwork-display';
import type { PublicArtwork } from '@/schemas/artwork';
import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Suspense, use } from 'react';

export const Route = createFileRoute('/')({
  // Not awaited: the featured notice streams in behind its skeleton
  loader: () => ({ latest: fetchLatestPublishedArtworks({ data: 4 }) }),
  component: HomePage,
});

function HomePage() {
  const { latest } = Route.useLoaderData();

  return (
    <div className="page-width pt-6 pb-6 md:pt-16">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="animate-rise">
          <h1 className="font-serif text-[2.35rem] leading-[1.02] font-medium tracking-tight sm:text-6xl lg:text-7xl">
            La peinture dans tout son art
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground sm:mt-5 sm:text-xl">
            (Re)découvrez l’histoire de la peinture à travers des notices scientifiques, et visitez
            les musées belges autrement.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 sm:mt-8">
            <Button size="lg" asChild className="rounded-full">
              <Link to="/artworks">Parcourir les notices</Link>
            </Button>
            <Link
              to="/about"
              className="inline-flex h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Qui écrit les notices ?
            </Link>
          </div>
        </div>

        <Suspense fallback={<FeaturedSkeleton />}>
          <Featured latest={latest} />
        </Suspense>
      </section>

      <Suspense fallback={null}>
        <Recent latest={latest} />
      </Suspense>
    </div>
  );
}

type Latest = ReturnType<typeof fetchLatestPublishedArtworks>;

/** The latest notice, as large as the screen allows: the reason to come back. */
function Featured({ latest }: { latest: Latest }) {
  const [artwork] = use(latest);
  if (!artwork) return null;
  return <FeaturedNotice artwork={artwork} />;
}

function FeaturedNotice({ artwork }: { artwork: PublicArtwork }) {
  const artistAndDate = cartelLine(artwork, ['artist', 'year']);
  return (
    <Link
      to="/artworks/$artworkId"
      params={{ artworkId: artwork.id }}
      className="group -mx-4 block outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0 sm:rounded-3xl"
    >
      <Painting
        image={mainImage(artwork.images)?.image}
        title={artwork.title}
        priority
        decorative
        className="aspect-[4/3] p-6 sm:aspect-[5/4] sm:rounded-3xl sm:p-12"
        imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.015]"
      />
      <div className="flex items-end justify-between gap-4 px-4 pt-4 sm:px-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-primary">Dernière notice</p>
          <p className="work-title mt-1 text-2xl leading-snug sm:text-3xl">{artwork.title}</p>
          {artistAndDate && <p className="mt-1 text-sm text-muted-foreground">{artistAndDate}</p>}
        </div>
        <span className="mb-1 flex size-11 shrink-0 items-center justify-center rounded-full border bg-card transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="size-5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="-mx-4 sm:mx-0">
      <Skeleton className="aspect-[5/4] rounded-none sm:rounded-3xl" />
      <div className="space-y-2 px-4 pt-4 sm:px-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-2/3" />
      </div>
    </div>
  );
}

/** The notices published before the featured one. */
function Recent({ latest }: { latest: Latest }) {
  const recent = use(latest).slice(1);
  if (recent.length === 0) return null;

  return (
    <section aria-labelledby="recent-heading" className="mt-16 md:mt-24">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 id="recent-heading" className="font-serif text-3xl font-medium tracking-tight">
          Publiées récemment
        </h2>
        <Link
          to="/whats-new"
          className="shrink-0 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Tout voir
        </Link>
      </div>
      {/* A swipeable rail on phones, a grid on wider screens */}
      <ul className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 max-sm:page-bleed sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-3">
        {recent.map(artwork => (
          <li key={artwork.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <ArtworkCard artwork={artwork} headingLevel={3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
