/** "Bruxelles, Belgique": the place's city and country, whichever are known. */
export function placeLocality(place: { city: string | null; country: string | null }): string {
  return [place.city, place.country].filter(Boolean).join(', ');
}

/** A maps link to the place's position. Phones open it in their maps app. */
export function placeMapUrl(place: { latitude: number; longitude: number }): string {
  const query = `${place.latitude},${place.longitude}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
