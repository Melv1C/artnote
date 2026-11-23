/** "René Magritte", or "Giotto" for an artist known by a single name (no last name). */
export function artistFullName(artist: { firstName: string; lastName: string }): string {
  return [artist.firstName, artist.lastName].filter(Boolean).join(' ');
}
