import { describe, expect, it } from 'vite-plus/test';
import { ArtistFormSchema } from './artist';
import { ArtworkFormSchema, PublicArtworkSchema, toArtworkForm } from './artwork';
import { MAX_IMAGES_PER_NOTICE } from './image';
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

  it('accepts no more images than the editor lets a writer attach', () => {
    const images = (count: number) =>
      Array.from({ length: count }, (_, sortOrder) => ({ ...attachment, sortOrder }));
    const parse = (count: number) =>
      ArtworkFormSchema.safeParse({ ...form, images: images(count) }).success;
    expect(parse(MAX_IMAGES_PER_NOTICE)).toBe(true);
    expect(parse(MAX_IMAGES_PER_NOTICE + 1)).toBe(false);
  });

  it('submits the editor’s chosen artists and place as ids', () => {
    const { placeId: _placeId, artistIds: _artistIds, ...values } = form;
    const submitted = toArtworkForm({
      ...values,
      status: 'DRAFT',
      images: [],
      artists: [
        { id: 'ar1', firstName: 'Hubert', lastName: 'van Eyck' },
        { id: 'ar2', firstName: 'Jan', lastName: 'van Eyck' },
      ],
      place: { id: 'p1', name: 'Cathédrale Saint-Bavon', city: 'Gand', country: 'Belgique' },
    });
    expect(submitted).toMatchObject({ artistIds: ['ar1', 'ar2'], placeId: 'p1' });
    expect(submitted).not.toHaveProperty('artists');
    expect(submitted).not.toHaveProperty('place');
    expect(
      toArtworkForm({ ...values, status: 'DRAFT', images: [], artists: [], place: null }),
    ).toMatchObject({ artistIds: [], placeId: null });
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
  const place = { name: 'MSK Gent', type: 'MUSEUM' };
  const issues = (input: object) =>
    PlaceFormSchema.safeParse({ ...place, ...input }).error?.issues.map(issue => issue.message);

  it('reads a full position from form strings', () => {
    const parsed = PlaceFormSchema.parse({ ...place, latitude: '51.04', longitude: '3.72' });
    expect(parsed.latitude).toBe(51.04);
    expect(parsed.longitude).toBe(3.72);
  });

  it('refuses a missing latitude or longitude, saying the position is missing', () => {
    expect(issues({ latitude: '51.04', longitude: '' })).toEqual([
      'Position manquante : indiquez la longitude',
    ]);
    expect(issues({ longitude: '3.72' })).toEqual(['Position manquante : indiquez la latitude']);
  });

  it('asks for a type when none is chosen', () => {
    expect(issues({ type: undefined, latitude: '51.04', longitude: '3.72' })).toEqual([
      'Le type est requis',
    ]);
  });

  it('keeps latitude and longitude within their ranges', () => {
    expect(issues({ latitude: '120', longitude: '3.72' })).toHaveLength(1);
    expect(issues({ latitude: '-91', longitude: '3.72' })).toHaveLength(1);
    expect(issues({ latitude: '51.04', longitude: '181' })).toHaveLength(1);
    expect(issues({ latitude: '90', longitude: '-180' })).toBeUndefined();
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

  it('takes an artist known by a single name, without a last name', () => {
    expect(ArtistFormSchema.parse({ firstName: 'Giotto', lastName: '' }).lastName).toBe('');
    expect(ArtistFormSchema.safeParse({ firstName: '', lastName: 'Giotto' }).success).toBe(false);
  });

  it('bounds a date’s length', () => {
    expect(ArtistFormSchema.safeParse({ ...artist, birthDate: 'x'.repeat(101) }).success).toBe(
      false,
    );
  });
});
