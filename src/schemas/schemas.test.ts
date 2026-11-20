import { describe, expect, it } from 'vitest';
import { PublicArtworkSchema } from './artwork';
import { PlaceFormSchema } from './place';
import { UserProfileFormSchema } from './user';

describe('PublicArtworkSchema', () => {
  it("strips the writer's private fields", () => {
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
      placeId: null,
      place: null,
      viewCount: 0,
      lastViewedAt: null,
      images: [],
      artists: [],
      writer: { id: 'u1', name: 'Ada', image: null, email: 'ada@example.com', role: 'admin' },
    };
    expect(PublicArtworkSchema.parse(row).writer).toEqual({ id: 'u1', name: 'Ada', image: null });
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
