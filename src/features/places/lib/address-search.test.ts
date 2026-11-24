import { describe, expect, it } from 'vite-plus/test';
import { applyAddressResult, toAddressResults } from './address-search';
// Recorded from Nominatim's search API (format=jsonv2, addressdetails=1, accept-language=fr)
import sample from './nominatim-sample.json';

describe('toAddressResults', () => {
  it('reads the label, position and address of each result', () => {
    expect(toAddressResults(sample)).toEqual([
      {
        label:
          'Musée des Beaux-Arts de Gand, 1, Fernand Scribedreef, Strop, Muinkparkwijk, Gand, Flandre-Orientale, Flandre, 9000, Belgique',
        latitude: 51.0379751,
        longitude: 3.7242437,
        address: 'Fernand Scribedreef 1',
        city: 'Gand',
        country: 'Belgique',
      },
      {
        label:
          'Basilique Saint-Martin, Klinkaert, Nederhem, Stroppen, Hal, Hal-Vilvorde, Brabant flamand, Flandre, 1500, Belgique',
        latitude: 50.7367614,
        longitude: 4.2374004,
        // No house number: the road alone; no city: the town
        address: 'Klinkaert',
        city: 'Hal',
        country: 'Belgique',
      },
    ]);
  });

  it('takes the city from the first of city, town, village or municipality', () => {
    const result = (address: Record<string, string>) =>
      toAddressResults([{ lat: '50', lon: '4', display_name: 'X', address }])[0]?.city;
    expect(result({ village: 'Damme', municipality: 'Bruges' })).toBe('Damme');
    expect(result({ municipality: 'Bruges' })).toBe('Bruges');
    expect(result({ town: 'Hal', village: 'Essenbeek' })).toBe('Hal');
  });

  it('leaves out what Nominatim does not give', () => {
    expect(
      toAddressResults([
        { lat: '50.5', lon: '4.47', display_name: 'Belgique', address: { country: 'Belgique' } },
        { lat: '50.5', lon: '4.47', display_name: 'Quelque part' },
        { lat: '50.5', lon: '4.47', display_name: 'Rue', address: { house_number: '3' } },
      ]),
    ).toEqual([
      { label: 'Belgique', latitude: 50.5, longitude: 4.47, country: 'Belgique' },
      { label: 'Quelque part', latitude: 50.5, longitude: 4.47 },
      { label: 'Rue', latitude: 50.5, longitude: 4.47 },
    ]);
  });

  it('has no results for an empty response', () => {
    expect(toAddressResults([])).toEqual([]);
  });

  it('keeps at most five results', () => {
    const many = Array.from({ length: 8 }, (_, i) => ({
      lat: '50',
      lon: '4',
      display_name: `Lieu ${i}`,
    }));
    expect(toAddressResults(many).map(result => result.label)).toEqual([
      'Lieu 0',
      'Lieu 1',
      'Lieu 2',
      'Lieu 3',
      'Lieu 4',
    ]);
  });
});

describe('applyAddressResult', () => {
  const result = {
    label: 'Musée des Beaux-Arts de Gand, …',
    latitude: 51.0379751,
    longitude: 3.7242437,
    address: 'Fernand Scribedreef 1',
    city: 'Gand',
    country: 'Belgique',
  };
  const empty = { latitude: '', longitude: '', address: '', city: '', country: '' };

  it('sets the position and fills the empty address fields', () => {
    expect(applyAddressResult(empty, result)).toEqual({
      latitude: '51.037975',
      longitude: '3.724244',
      address: 'Fernand Scribedreef 1',
      city: 'Gand',
      country: 'Belgique',
    });
  });

  it('keeps what the writer typed, and replaces the position', () => {
    expect(
      applyAddressResult(
        {
          latitude: '50',
          longitude: '4',
          address: 'Fernand Scribedreef 1-2',
          city: 'Gent',
          country: ' ',
        },
        result,
      ),
    ).toEqual({
      latitude: '51.037975',
      longitude: '3.724244',
      address: 'Fernand Scribedreef 1-2',
      city: 'Gent',
      country: 'Belgique',
    });
  });

  it('leaves an empty field empty when the result lacks it', () => {
    expect(
      applyAddressResult(empty, { label: 'Belgique', latitude: 50.5, longitude: 4.47 }),
    ).toEqual({ ...empty, latitude: '50.5', longitude: '4.47' });
  });
});
