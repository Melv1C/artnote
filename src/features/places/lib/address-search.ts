import type { AddressResult } from '@/schemas/place';
import { formatCoordinate } from './place-position';

/** The most results an address search shows. */
export const MAX_ADDRESS_RESULTS = 5;

/** The fields of a Nominatim search result (`format=jsonv2&addressdetails=1`) we read. */
export interface NominatimPlace {
  lat: string;
  lon: string;
  display_name: string;
  address?: Partial<Record<string, string>>;
}

/**
 * Nominatim's search response as address search results: its full label, its position, the
 * street (road and house number, Belgian style), the city (first of city, town, village or
 * municipality) and the country, each left out when Nominatim does not give it.
 */
export function toAddressResults(places: NominatimPlace[]): AddressResult[] {
  return places.slice(0, MAX_ADDRESS_RESULTS).map(({ lat, lon, display_name, address = {} }) => {
    const street = address.road && [address.road, address.house_number].filter(Boolean).join(' ');
    const city = address.city ?? address.town ?? address.village ?? address.municipality;
    return {
      label: display_name,
      latitude: Number(lat),
      longitude: Number(lon),
      ...(street && { address: street }),
      ...(city && { city }),
      ...(address.country && { country: address.country }),
    };
  });
}

/** The place form fields an address search result fills, as the form holds them (text). */
export interface AddressFields {
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  country: string;
}

const fillIfEmpty = (current: string, found: string | undefined) =>
  current.trim() === '' && found ? found : current;

/**
 * The form after the writer picks a search result: the position is always the result's; the
 * address, city and country are filled only where empty, so a search never overwrites the
 * writer's own wording.
 */
export function applyAddressResult(fields: AddressFields, result: AddressResult): AddressFields {
  return {
    latitude: formatCoordinate(result.latitude),
    longitude: formatCoordinate(result.longitude),
    address: fillIfEmpty(fields.address, result.address),
    city: fillIfEmpty(fields.city, result.city),
    country: fillIfEmpty(fields.country, result.country),
  };
}
