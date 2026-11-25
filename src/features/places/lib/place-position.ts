import { COORDINATE_LIMITS } from '@/schemas/place';

/** A place's position, as the place form schema accepts it. */
export interface PlacePosition {
  latitude: number;
  longitude: number;
}

/** Where the position picker opens for a place without a position: all of Belgium. */
export const BELGIUM_VIEW = { center: [4.47, 50.5] as [number, number], zoom: 6.5 };

/** The zoom the position picker opens at on a place's position: a few streets around it. */
export const POSITION_ZOOM = 15;

function parseCoordinate(value: string, name: keyof typeof COORDINATE_LIMITS): number | null {
  if (value.trim() === '') return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= COORDINATE_LIMITS[name]
    ? coordinate
    : null;
}

/**
 * The position the latitude and longitude fields hold, or null while either is empty, not a
 * number or out of range (the map then shows no marker).
 */
export function parsePosition(latitude: string, longitude: string): PlacePosition | null {
  const lat = parseCoordinate(latitude, 'latitude');
  const lng = parseCoordinate(longitude, 'longitude');
  return lat === null || lng === null ? null : { latitude: lat, longitude: lng };
}

/** A coordinate for the form fields: six decimals (about 10 cm), no trailing zeros. */
export function formatCoordinate(value: number): string {
  return String(Number(value.toFixed(6)));
}
