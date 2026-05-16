export function formatArtistName(artist: { firstName?: string | null; lastName: string }) {
  return [artist.firstName, artist.lastName].filter(Boolean).join(' ');
}
