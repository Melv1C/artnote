import { artistFullName } from '@/features/artists/lib/artist-name';
import type { ArtworkImage } from '@/schemas/artwork-image';

interface NamedArtist {
  artist: { firstName: string; lastName: string };
  role?: string | null;
}

/** "Pieter Bruegel l’Ancien", or "Hubert van Eyck et Jan van Eyck" for two, "A, B et C" for more. */
export function artistNames(artists: NamedArtist[]): string {
  const names = artists.map(({ artist }) => artistFullName(artist));
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

/** The image that stands for a notice: the one marked main, else the first. */
export function mainImage<T extends Pick<ArtworkImage, 'isMain'>>(images: T[]): T | undefined {
  return images.find(image => image.isMain) ?? images[0];
}

interface CartelSource {
  artists: NamedArtist[];
  creationYear: string | null;
  place?: { name: string } | null;
}

type CartelFact = 'artist' | 'year' | 'place';

/**
 * A line of a notice's cartel (the museum label): the chosen facts among its artists, date and
 * place, in that order, leaving out the unknown ones. "Pieter Bruegel l’Ancien, vers 1560".
 */
export function cartelLine(artwork: CartelSource, facts: CartelFact[]): string {
  const values: Record<CartelFact, string | null | undefined> = {
    artist: artistNames(artwork.artists),
    year: artwork.creationYear,
    place: artwork.place?.name,
  };
  return (['artist', 'year', 'place'] as const)
    .filter(fact => facts.includes(fact))
    .map(fact => values[fact])
    .filter(Boolean)
    .join(', ');
}
