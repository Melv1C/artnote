import { cn } from '@/lib/utils';
import type { PublicArtwork } from '@/schemas/artwork';
import { Link } from '@tanstack/react-router';
import { artistNames, mainImage } from '../lib/artwork-display';
import { Painting } from './painting';

interface ArtworkCardProps {
  artwork: PublicArtwork;
  /** The first cards of a list load their image at once */
  priority?: boolean;
  className?: string;
}

/**
 * A notice in a list: the painting on its wall, then its cartel (the museum label): artist, title
 * in italics, date and place.
 */
export function ArtworkCard({ artwork, priority, className }: ArtworkCardProps) {
  const { id, title, creationYear, images, place, artists } = artwork;
  const artist = artistNames(artists);

  return (
    <Link
      to="/artworks/$artworkId"
      params={{ artworkId: id }}
      className={cn(
        'group flex flex-col rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background',
        className,
      )}
    >
      <Painting
        image={mainImage(images)?.image}
        title={title}
        priority={priority}
        className="aspect-[4/3] rounded-2xl p-6 transition-colors duration-300 group-hover:bg-accent sm:p-8"
        imgClassName="transition-transform duration-500 ease-out group-hover:scale-[1.02]"
      />
      <div className="space-y-1 px-1 pt-4">
        {artist && <p className="text-sm font-semibold text-foreground">{artist}</p>}
        <h3 className="work-title text-[1.375rem] leading-snug text-foreground decoration-primary/40 decoration-1 underline-offset-4 group-hover:underline">
          {title}
        </h3>
        {(creationYear || place) && (
          <p className="text-sm text-muted-foreground">
            {[creationYear, place?.name].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </Link>
  );
}
