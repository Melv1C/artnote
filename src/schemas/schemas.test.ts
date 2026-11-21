import { describe, expect, it } from 'vite-plus/test';
import { ArtistFormSchema } from './artist';
import { ArtworkFormSchema, PublicArtworkSchema } from './artwork';
import { PlaceFormSchema } from './place';
import { UserProfileFormSchema } from './user';

const audit = {
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'u1',
  updatedById: 'u1',
};

describe('PublicArtworkSchema', () => {
  const row = {
    id: 'a1',
    title: 'La Mort de Marat',
    creationYear: '1793',
    medium: null,
    dimensions: null,
    notice: null,
    sources: null,
    status: 'PUBLISHED',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    writerId: 'u1',
    placeId: 'p1',
    place: {
      id: 'p1',
      name: 'MRBAB',
      type: 'MUSEUM',
      address: null,
      city: 'Bruxelles',
      country: 'Belgique',
      latitude: null,
      longitude: null,
      website: null,
      description: null,
      ...audit,
    },
    viewCount: 12,
    lastViewedAt: new Date(),
    images: [],
    artists: [
      {
        role: null,
        artist: {
          id: 'ar1',
          firstName: 'Jacques-Louis',
          lastName: 'David',
          birthDate: null,
          deathDate: null,
          biography: null,
          ...audit,
        },
      },
    ],
    writer: { id: 'u1', name: 'Ada', image: null, email: 'ada@example.com', role: 'admin' },
  };

  it('keeps only public fields, at every level', () => {
    const notice = PublicArtworkSchema.parse(row);
    expect(notice.writer).toEqual({ id: 'u1', name: 'Ada', image: null });
    expect(notice).not.toHaveProperty('writerId');
    expect(notice).not.toHaveProperty('viewCount');
    expect(notice).not.toHaveProperty('lastViewedAt');
    expect(notice.place).not.toHaveProperty('createdById');
    expect(notice.place).not.toHaveProperty('updatedById');
    expect(notice.artists[0]?.artist).not.toHaveProperty('createdById');
    expect(notice.artists[0]?.artist).not.toHaveProperty('updatedById');
  });
});

describe('ArtworkFormSchema', () => {
  const form = {
    title: 'Marat',
    creationYear: null,
    medium: null,
    dimensions: null,
    notice: null,
    sources: null,
    status: 'DRAFT',
    placeId: null,
    artistIds: [],
  };
  const attachment = { imageId: 'img1', sortOrder: 0, isMain: true, legend: null, source: null };

  it('drops the image details the editor sends along with each attachment', () => {
    const parsed = ArtworkFormSchema.parse({
      ...form,
      images: [{ ...attachment, image: { id: 'img1', url: 'https://evil.example/x.png' } }],
    });
    expect(parsed.images).toEqual([attachment]);
  });

  it('reports default validation errors in French', () => {
    const result = ArtworkFormSchema.safeParse({ ...form, images: [], medium: 'x'.repeat(300) });
    const message = result.error?.issues[0]?.message ?? '';
    expect(message).not.toMatch(/too big/i);
    expect(message).toMatch(/trop/i);
  });

  it('rejects unbounded ids', () => {
    const result = ArtworkFormSchema.safeParse({
      ...form,
      images: [{ ...attachment, imageId: 'x'.repeat(65) }],
    });
    expect(result.success).toBe(false);
  });
});

describe('UserProfileFormSchema', () => {
  it('only accepts https links as CV', () => {
    const profile = (cv: string) => UserProfileFormSchema.safeParse({ name: 'Ada', cv }).success;
    expect(profile('https://ada.example/cv.pdf')).toBe(true);
    expect(profile('')).toBe(true);
    expect(profile('javascript:alert(1)')).toBe(false);
    expect(profile('http://ada.example')).toBe(false);
  });
});

describe('PlaceFormSchema', () => {
  it('reads coordinates from form strings, empty meaning unset', () => {
    const place = PlaceFormSchema.parse({
      name: 'MSK Gent',
      type: 'MUSEUM',
      latitude: '51.04',
      longitude: '',
    });
    expect(place.latitude).toBe(51.04);
    expect(place.longitude).toBeUndefined();
    expect(PlaceFormSchema.safeParse({ name: 'X', type: 'MUSEUM', latitude: '120' }).success).toBe(
      false,
    );
  });
});

describe('ArtistFormSchema', () => {
  const artist = { firstName: 'Pieter', lastName: 'Bruegel' };

  it('takes birth and death dates as free text, as precise as the sources allow', () => {
    for (const date of ['01/01/1950', '1950', 'vers 1525', 'XIXe siècle']) {
      expect(ArtistFormSchema.parse({ ...artist, birthDate: date }).birthDate).toBe(date);
    }
    expect(ArtistFormSchema.parse({ ...artist, deathDate: ' 1569 ' }).deathDate).toBe('1569');
  });

  it('bounds a date’s length', () => {
    expect(ArtistFormSchema.safeParse({ ...artist, birthDate: 'x'.repeat(101) }).success).toBe(
      false,
    );
  });
});
