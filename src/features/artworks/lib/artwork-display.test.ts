import { describe, expect, it } from 'vite-plus/test';
import { artistNames, cartelLine, galleryOrder, mainImage } from './artwork-display';

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

  it('opens the gallery on the main image and keeps the writer’s order after it', () => {
    expect(galleryOrder(images).map(i => i.id)).toEqual(['main', 'b', 'a']);
    expect(galleryOrder(images.filter(i => !i.isMain)).map(i => i.id)).toEqual(['b', 'a']);
  });
});

describe('cartelLine', () => {
  const artwork = {
    artists: [artist('Pieter', 'Bruegel l’Ancien')],
    creationYear: 'vers 1560',
    place: { name: 'Musées royaux des Beaux-Arts' },
  };

  it('joins the chosen facts in the cartel’s order', () => {
    expect(cartelLine(artwork, ['place', 'artist', 'year'])).toBe(
      'Pieter Bruegel l’Ancien, vers 1560, Musées royaux des Beaux-Arts',
    );
    expect(cartelLine(artwork, ['year', 'place'])).toBe('vers 1560, Musées royaux des Beaux-Arts');
  });

  it('leaves out what is unknown, the date included when there is no artist', () => {
    expect(cartelLine({ ...artwork, artists: [] }, ['artist', 'year'])).toBe('vers 1560');
    expect(cartelLine({ artists: [], creationYear: null, place: null }, ['artist', 'year'])).toBe(
      '',
    );
  });
});
