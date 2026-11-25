import { describe, expect, it } from 'vite-plus/test';
import { placeLocality, placeMapUrl } from './place-display';

describe('places', () => {
  const place = {
    name: 'Musées royaux des Beaux-Arts',
    address: 'Rue de la Régence 3',
    city: 'Bruxelles',
    country: 'Belgique',
    latitude: null,
    longitude: null,
  };

  it('describes the locality with what is known', () => {
    expect(placeLocality(place)).toBe('Bruxelles, Belgique');
    expect(placeLocality({ city: null, country: 'Belgique' })).toBe('Belgique');
  });

  it('links to a map by coordinates, else by name and address', () => {
    expect(placeMapUrl({ ...place, latitude: 50.84, longitude: 4.36 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=50.84%2C4.36',
    );
    expect(placeMapUrl(place)).toContain(
      encodeURIComponent('Musées royaux des Beaux-Arts, Rue de la Régence 3'),
    );
  });
});
