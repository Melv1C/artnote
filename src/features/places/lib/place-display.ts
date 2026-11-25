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
