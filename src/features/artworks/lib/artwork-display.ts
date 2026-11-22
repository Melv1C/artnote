import type { ArtworkImage } from '@/schemas/artwork-image';

interface NamedArtist {
  artist: { firstName: string; lastName: string };
  role?: string | null;
}

/** "Pieter Bruegel l’Ancien", or "Hubert van Eyck et Jan van Eyck" for two, "A, B et C" for more. */
export function artistNames(artists: NamedArtist[]): string {
  const names = artists.map(({ artist }) => `${artist.firstName} ${artist.lastName}`.trim());
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`;
}

/** The image that stands for a notice: the one marked main, else the first. */
export function mainImage<T extends Pick<ArtworkImage, 'isMain'>>(images: T[]): T | undefined {
  return images.find(image => image.isMain) ?? images[0];
}

/** The images in the writer's order, the main one first. */
export function orderedImages<T extends Pick<ArtworkImage, 'isMain' | 'sortOrder'>>(
  images: T[],
): T[] {
  return [...images].sort(
    (a, b) => Number(b.isMain) - Number(a.isMain) || a.sortOrder - b.sortOrder,
  );
}

interface LocatedPlace {
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

/** "Bruxelles, Belgique": the place's city and country, whichever are known. */
export function placeLocality(place: Pick<LocatedPlace, 'city' | 'country'>): string {
  return [place.city, place.country].filter(Boolean).join(', ');
}

/**
 * A maps link for the place: its coordinates when known, else its name and address. Phones open it
 * in their maps app.
 */
export function placeMapUrl(place: LocatedPlace): string {
  const query =
    place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : [place.name, place.address, place.city, place.country].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
