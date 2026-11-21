import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { RichTextViewer } from '@/components/ui/rich-text-editor';
import { initials } from '@/lib/initials';
import { cn } from '@/lib/utils';
import type { PublicArtwork } from '@/schemas/artwork';
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Images, MapPin, Navigation } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { artistNames, orderedImages, placeLocality, placeMapUrl } from '../lib/artwork-display';
import { ArtworkGallery } from './artwork-gallery';
import { ArtworkImageViewer } from './artwork-image-viewer';
import { ShareButton } from './share-button';

interface ArtworkDetailProps {
  artwork: PublicArtwork;
  /** An admin's preview: its link is not for readers, so it is not offered for sharing */
  preview?: boolean;
}

/**
 * A notice as readers see it. On a phone: the painting on its wall, then its cartel, the notice
 * and where to see the work. On a wide screen the painting stays in view beside the text.
 */
export function ArtworkDetail({ artwork, preview }: ArtworkDetailProps) {
  const { title, creationYear, medium, dimensions, notice, sources, writer, place, artists } =
    artwork;
  const images = orderedImages(artwork.images);
  const artist = artistNames(artists);
  const roles = artists.filter(a => a.role && a.role !== 'peintre');

  const [viewer, setViewer] = useState({ open: false, index: 0 });
  const openViewer = (index: number) => setViewer({ open: true, index });

  return (
    <article className="pb-24 md:pb-12">
      <BackLink />

      <div className="page-width lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] [&>*]:min-w-0 lg:gap-12 lg:pt-4 xl:gap-16">
        <GalleryColumn onReopen={images.length > 0 ? () => openViewer(0) : undefined}>
          {galleryRef => (
            <div ref={galleryRef}>
              <ArtworkGallery
                title={title}
                images={images}
                onOpen={openViewer}
                className="-mx-4 sm:mx-0 lg:h-[calc(100svh-var(--header-total)-6rem)]"
              />
            </div>
          )}
        </GalleryColumn>

        <div className="pt-8 lg:pt-2">
          {/* The cartel: what a museum label says about the work */}
          <header className="space-y-3">
            {artist && <p className="text-base font-semibold">{artist}</p>}
            <h1 className="work-title text-[2.1rem] leading-[1.1] tracking-tight sm:text-5xl">
              {title}
            </h1>
            {creationYear && <p className="text-lg text-muted-foreground">{creationYear}</p>}
          </header>

          {(medium || dimensions || roles.length > 0) && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-5 text-sm">
              {medium && <Fact label="Technique">{medium}</Fact>}
              {dimensions && <Fact label="Dimensions">{dimensions}</Fact>}
              {roles.map(({ artist: a, role }) => (
                <Fact key={a.id} label={capitalize(role ?? '')}>
                  {a.firstName} {a.lastName}
                </Fact>
              ))}
            </dl>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            {/* One image is opened by tapping it; several deserve saying so */}
            {images.length > 1 && (
              <Button variant="outline" className="rounded-full" onClick={() => openViewer(0)}>
                <Images />
                Voir les {images.length} images
              </Button>
            )}
            {!preview && (
              <ShareButton title={title} text={artist ? `${title}, ${artist}` : title} />
            )}
          </div>

          {notice && (
            <section aria-labelledby="notice-heading" className="mt-10">
              <h2 id="notice-heading" className="sr-only">
                Notice
              </h2>
              <RichTextViewer content={notice} className="reading max-w-[65ch]" />
            </section>
          )}

          {place && (
            <section
              aria-labelledby="place-heading"
              className="mt-10 rounded-2xl border bg-card p-5 shadow-xs"
            >
              <h2
                id="place-heading"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <MapPin className="size-4" aria-hidden="true" />
                Où voir l’œuvre
              </h2>
              <p className="mt-2 font-serif text-xl leading-snug font-medium">{place.name}</p>
              {(place.address || placeLocality(place)) && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {[place.address, placeLocality(place)].filter(Boolean).join(', ')}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" className="rounded-full">
                  <a href={placeMapUrl(place)} target="_blank" rel="noopener noreferrer">
                    <Navigation />
                    Itinéraire
                    <span className="sr-only">(nouvel onglet)</span>
                  </a>
                </Button>
                {isWebLink(place.website) && (
                  <Button asChild size="sm" variant="outline" className="rounded-full">
                    <a href={place.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink />
                      Site du lieu
                      <span className="sr-only">(nouvel onglet)</span>
                    </a>
                  </Button>
                )}
              </div>
            </section>
          )}

          {sources && (
            <section aria-labelledby="sources-heading" className="mt-10">
              <h2 id="sources-heading" className="font-serif text-xl font-medium">
                Bibliographie
              </h2>
              <RichTextViewer
                content={sources}
                className="reading reading-sm mt-3 max-w-[65ch] text-muted-foreground"
              />
            </section>
          )}

          <footer className="mt-10 flex items-center gap-3 border-t pt-6">
            <Avatar className="size-11">
              <AvatarImage src={writer.image || undefined} alt="" />
              <AvatarFallback className="bg-accent text-sm font-semibold text-accent-foreground">
                {initials(writer.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              Notice rédigée par
              <span className="block text-base font-medium text-foreground">{writer.name}</span>
            </p>
          </footer>
        </div>
      </div>

      <ArtworkImageViewer
        title={title}
        images={images}
        open={viewer.open}
        startIndex={viewer.index}
        onOpenChange={open => setViewer(v => ({ ...v, open }))}
      />
    </article>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  );
}

/** Only http(s) addresses become links: a place's website is typed by an admin */
function isWebLink(url: string | null): url is string {
  return url != null && /^https?:\/\//i.test(url);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Back to where the reader came from, or to the list. An installed app has no back button. */
function BackLink() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const className =
    'inline-flex h-11 items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

  return (
    <div className="page-width">
      {canGoBack ? (
        <button type="button" onClick={() => router.history.back()} className={className}>
          <ArrowLeft className="size-4" />
          Retour
        </button>
      ) : (
        <Link to="/artworks" className={className}>
          <ArrowLeft className="size-4" />
          Toutes les notices
        </Link>
      )}
    </div>
  );
}

/**
 * The column of the gallery: sticky beside the text on wide screens. On a phone, once the reader
 * has scrolled past it, a button opens the images full screen without losing their place.
 */
function GalleryColumn({
  children,
  onReopen,
}: {
  children: (ref: React.RefObject<HTMLDivElement | null>) => React.ReactNode;
  onReopen?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [outOfView, setOutOfView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setOutOfView(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-total)+1.5rem)] lg:self-start">
      {children(ref)}
      {onReopen && (
        <button
          type="button"
          onClick={onReopen}
          tabIndex={outOfView ? 0 : -1}
          aria-hidden={!outOfView}
          className={cn(
            'fixed right-4 bottom-[calc(var(--tabbar-height)+env(safe-area-inset-bottom)+1rem)] z-30 md:bottom-6 flex h-11 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden',
            outOfView ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
          )}
        >
          <Images className="size-4" aria-hidden="true" />
          Revoir l’œuvre
        </button>
      )}
    </div>
  );
}
