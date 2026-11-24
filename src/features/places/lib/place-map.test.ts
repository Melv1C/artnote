import { describe, expect, it } from 'vite-plus/test';
import { mapMarkers, noticeCountLabel, placesBounds, placesToGeoJSON } from './place-map';

const brussels = { id: 'brussels', latitude: 50.8417, longitude: 4.3579, noticeCount: 2 };
const ghent = { id: 'ghent', latitude: 51.0531, longitude: 3.7272, noticeCount: 1 };

describe('noticeCountLabel', () => {
  it('says "notice" for one and "notices" for more', () => {
    expect(noticeCountLabel(1)).toBe('1 notice');
    expect(noticeCountLabel(3)).toBe('3 notices');
  });
});

describe('placesToGeoJSON', () => {
  it('puts each place at its position with its number of notices', () => {
    expect(placesToGeoJSON([brussels])).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [4.3579, 50.8417] },
          properties: { placeId: 'brussels', noticeCount: 2 },
        },
      ],
    });
  });
});

describe('placesBounds', () => {
  it('spans every place, west-south to east-north', () => {
    expect(placesBounds([brussels, ghent])).toEqual([
      [3.7272, 50.8417],
      [4.3579, 51.0531],
    ]);
  });

  it('is a single point for one place', () => {
    expect(placesBounds([ghent])).toEqual([
      [3.7272, 51.0531],
      [3.7272, 51.0531],
    ]);
  });

  it('is null without places', () => {
    expect(placesBounds([])).toBeNull();
  });
});

describe('mapMarkers', () => {
  const point = (coordinates: [number, number], properties: Record<string, unknown>) => ({
    geometry: { type: 'Point' as const, coordinates },
    properties,
  });

  it('turns places and groups into markers, a group carrying the total of its notices', () => {
    expect(
      mapMarkers([
        point([4.3579, 50.8417], { placeId: 'brussels', noticeCount: 2 }),
        point([4.1, 50.9], { cluster: true, cluster_id: 7, point_count: 3, noticeCount: 9 }),
      ]),
    ).toEqual([
      {
        key: 'place-brussels',
        kind: 'place',
        placeId: 'brussels',
        noticeCount: 2,
        longitude: 4.3579,
        latitude: 50.8417,
      },
      {
        key: 'cluster-7',
        kind: 'cluster',
        clusterId: 7,
        noticeCount: 9,
        longitude: 4.1,
        latitude: 50.9,
      },
    ]);
  });

  it('keeps one marker for a feature repeated across tiles', () => {
    const brusselsFeature = point([4.3579, 50.8417], { placeId: 'brussels', noticeCount: 2 });
    expect(mapMarkers([brusselsFeature, brusselsFeature])).toHaveLength(1);
  });
});
