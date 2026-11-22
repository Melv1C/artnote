import { describe, expect, it } from 'vite-plus/test';
import {
  artistNames,
  mainImage,
  orderedImages,
  placeLocality,
  placeMapUrl,
} from './artwork-display';

const artist = (firstName: string, lastName: string) => ({ artist: { firstName, lastName } });

describe('artistNames', () => {
  it('joins names the French way', () => {
    expect(artistNames([])).toBe('');
    expect(artistNames([artist('Pieter', 'Bruegel l’Ancien')])).toBe('Pieter Bruegel l’Ancien');
    expect(artistNames([artist('Hubert', 'van Eyck'), artist('Jan', 'van Eyck')])).toBe(
      'Hubert van Eyck et Jan van Eyck',
    );
    expect(artistNames([artist('A', 'A'), artist('B', 'B'), artist('C', 'C')])).toBe(
      'A A, B B et C C',
    );
  });
});

describe('images', () => {
  const images = [
    { id: 'b', isMain: false, sortOrder: 2 },
    { id: 'a', isMain: false, sortOrder: 1 },
    { id: 'main', isMain: true, sortOrder: 3 },
  ];

  it('picks the main image, else the first', () => {
    expect(mainImage(images)?.id).toBe('main');
    expect(mainImage(images.filter(i => !i.isMain))?.id).toBe('b');
    expect(mainImage([])).toBeUndefined();
  });

  it('orders the main image first, then by position', () => {
    expect(orderedImages(images).map(i => i.id)).toEqual(['main', 'a', 'b']);
  });
});

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
