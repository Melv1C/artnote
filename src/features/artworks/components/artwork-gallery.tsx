import { RichTextViewer } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import type { ArtworkImage } from '@/schemas/artwork-image';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { useRef, useState } from 'react';
import { Painting } from './painting';

interface ArtworkGalleryProps {
  title: string;
  images: ArtworkImage[];
  onOpen: (index: number) => void;
  className?: string;
}

/**
 * The notice's images on the wall. Swipe between them on a phone (native scroll snapping), arrows
 * on a computer; a tap opens the full-screen viewer. The legend of the image in view sits below.
 */
export function ArtworkGallery({ title, images, onOpen, className }: ArtworkGalleryProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const current = images[index];

  const goTo = (next: number) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollTo({ left: next * rail.clientWidth, behavior: 'smooth' });
  };

  if (images.length === 0) {
    // No height from the page: an empty wall keeps its 4:3 shape within the column
    return (
      <Painting
        image={undefined}
        title={title}
        className="-mx-4 aspect-[4/3] min-w-0 sm:mx-0 sm:rounded-2xl"
      />
    );
  }

  return (
    <figure className={cn('flex flex-col', className)} aria-roledescription="galerie">
      <div className="relative min-h-0 flex-1 bg-wall sm:overflow-hidden sm:rounded-2xl">
        <div
          ref={railRef}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          onScroll={event => {
            const rail = event.currentTarget;
            setIndex(Math.round(rail.scrollLeft / rail.clientWidth));
          }}
        >
          {images.map((attachment, i) => (
            <button
              key={attachment.imageId}
              type="button"
              onClick={() => onOpen(i)}
              className="group relative flex h-full w-full shrink-0 snap-center items-center justify-center px-6 py-8 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:p-10"
              aria-label={`Agrandir l’image ${i + 1} sur ${images.length}`}
            >
              <Painting
                image={attachment.image}
                title={title}
                priority={i === 0}
                className="h-full w-full bg-transparent"
                imgClassName="max-h-[60svh] lg:max-h-full"
              />
            </button>
          ))}
        </div>

        <span className="pointer-events-none absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur sm:right-3 sm:bottom-3 sm:size-9">
          <Expand className="size-4" aria-hidden="true" />
        </span>

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" disabled={index === 0} onClick={() => goTo(index - 1)} />
            <GalleryArrow
              side="right"
              disabled={index === images.length - 1}
              onClick={() => goTo(index + 1)}
            />
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5"
              aria-hidden="true"
            >
              {images.map((attachment, i) => (
                <span
                  key={attachment.imageId}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === index ? 'w-5 bg-foreground/70' : 'w-1.5 bg-foreground/25',
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {(images.length > 1 || current?.legend || current?.source) && (
        <figcaption className="space-y-1 px-4 pt-3 text-sm text-muted-foreground sm:px-0">
          {images.length > 1 && (
            <p className="font-medium tabular-nums text-foreground" aria-live="polite">
              Image {index + 1} sur {images.length}
            </p>
          )}
          {current?.legend && <RichTextViewer content={current.legend} className="reading-sm" />}
          {current?.source && (
            <div className="flex gap-1 text-xs">
              <span>Source :</span>
              <RichTextViewer content={current.source} />
            </div>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function GalleryArrow({
  side,
  disabled,
  onClick,
}: {
  side: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'absolute top-1/2 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-md backdrop-blur transition-opacity hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 md:flex',
        side === 'left' ? 'left-3' : 'right-3',
      )}
      aria-label={side === 'left' ? 'Image précédente' : 'Image suivante'}
    >
      <Icon className="size-5" />
    </button>
  );
}
