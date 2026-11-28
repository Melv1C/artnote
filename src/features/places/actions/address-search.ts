import { requirePermission } from '@/lib/auth-functions';
import { z } from '@/lib/zod';
import { AddressResultSchema, AddressSearchSchema } from '@/schemas/place';
import { createServerFn } from '@tanstack/react-start';
import { MAX_ADDRESS_RESULTS, toAddressResults } from '../lib/address-search';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
// Nominatim's usage policy asks for an identifying User-Agent; no email is sent
const USER_AGENT = 'ArtNote (https://artnote.melvyn.be)';
const TIMEOUT_MS = 5000;

const NominatimResponseSchema = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    display_name: z.string(),
    address: z.record(z.string(), z.string()).optional(),
  }),
);

/**
 * The place form's address search: Nominatim's results for an address or a place name, from the
 * server so readers' browsers never contact it. No result is an empty list; a failed or slow
 * call throws.
 */
export const searchAddress = createServerFn({ method: 'GET' })
  .middleware([requirePermission({ place: ['manage'] })])
  .validator(AddressSearchSchema)
  .handler(async ({ data: { query } }) => {
    const url = new URL(NOMINATIM_SEARCH_URL);
    url.search = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      addressdetails: '1',
      limit: String(MAX_ADDRESS_RESULTS),
      'accept-language': 'fr',
    }).toString();

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Nominatim answered ${response.status}`);
    const places = NominatimResponseSchema.parse(await response.json());
    return z.array(AddressResultSchema).parse(toAddressResults(places));
  });
