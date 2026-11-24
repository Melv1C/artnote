import { Painting } from '@/features/artworks/components/painting';
import { cn } from '@/lib/utils';
import type { MapPlace } from '@/schemas/place';
import { Link } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useId } from 'react';
import { moreNoticesLabel, noticeCountLabel } from '../lib/place-map';
import { PLACE_TYPE_LABELS } from '../lib/place-types';

interface PlaceDetailsProps {
  place: MapPlace;
  onClose: () => void;
  className?: string;
}

/**
 * What a reader sees of a place on the map: what it is, its number of published notices, the
 * newest of them, and a link to all of them when the list stops short.
 */
export function PlaceDetails({ place, onClose, className }: PlaceDetailsProps) {
  const headingId = useId();
  const more = moreNoticesLabel(place.noticeCount);

  return (
    <section aria-labelledby={headingId} className={cn('relative p-4', className)}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <h2 id={headingId} className="pr-8 font-serif text-lg leading-tight font-medium">
        {place.name}
      </h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {[PLACE_TYPE_LABELS[place.type], place.city].filter(Boolean).join(' · ')}
      </p>
      <p className="mt-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {noticeCountLabel(place.noticeCount)}
      </p>
      <ul className="mt-1.5 space-y-1">
        {place.notices.map(notice => (
          <li key={notice.id}>
            <Link
              to="/artworks/$artworkId"
              params={{ artworkId: notice.id }}
              className="-mx-1.5 flex items-center gap-3 rounded-md p-1.5 transition-colors outline-none hover:bg-muted focus-visible:bg-muted"
            >
              <Painting
                image={notice.image ?? undefined}
                title={notice.title}
                className="size-11 shrink-0 rounded-sm p-1 [&_span]:hidden [&_svg]:size-4"
                imgClassName="shadow-sm"
                decorative
              />
              <span className="work-title line-clamp-2 text-sm">{notice.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      {more && (
        <Link
          to="/artworks"
          search={{ place: place.name }}
          className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
        >
          {more}
        </Link>
      )}
    </section>
  );
}
