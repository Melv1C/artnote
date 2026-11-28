import { describe, expect, it } from 'vite-plus/test';
import { placeLocality, placeMapUrl } from './place-display';

describe('places', () => {
  it('describes the locality with what is known', () => {
    expect(placeLocality({ city: 'Bruxelles', country: 'Belgique' })).toBe('Bruxelles, Belgique');
    expect(placeLocality({ city: null, country: 'Belgique' })).toBe('Belgique');
  });

  it('links to a map by position', () => {
    expect(placeMapUrl({ latitude: 50.84, longitude: 4.36 })).toBe(
      'https://www.google.com/maps/search/?api=1&query=50.84%2C4.36',
    );
  });
});
