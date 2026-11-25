import type * as GeoJSON from 'geojson';

/** What the map needs of a place: where it is and how many published notices it has. */
interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  noticeCount: number;
}

/** A marker the map shows: one place, or a group of nearby places when zoomed out. */
export type MapMarker = {
  key: string;
  noticeCount: number;
  longitude: number;
  latitude: number;
} & ({ kind: 'place'; placeId: string } | { kind: 'cluster'; clusterId: number });

/** The padding and maximum zoom of the opening view, so a single place doesn't open at street level. */
export const MAP_FIT = { padding: 64, maxZoom: 12 } as const;

/**
 * What MapLibre adds up when it groups places: a group's `noticeCount` is the total of its
 * places' notices, not its number of places.
 */
export const NOTICE_COUNT_CLUSTER_PROPERTIES = {
  noticeCount: ['+', ['get', 'noticeCount']],
} as const;

export function noticeCountLabel(count: number): string {
  return `${count} ${count === 1 ? 'notice' : 'notices'}`;
}

/** How many of a place's published notices its details list; the rest are behind a link. */
export const MAP_NOTICES_SHOWN = 3;

/** "Voir les N notices" when a place has more notices than its details list, else null. */
export function moreNoticesLabel(count: number): string | null {
  return count > MAP_NOTICES_SHOWN ? `Voir les ${count} notices` : null;
}

/** The places as the GeoJSON source MapLibre clusters. */
export function placesToGeoJSON(
  places: MapPoint[],
): GeoJSON.FeatureCollection<GeoJSON.Point, { placeId: string; noticeCount: number }> {
  return {
    type: 'FeatureCollection',
    features: places.map(place => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [place.longitude, place.latitude] },
      properties: { placeId: place.id, noticeCount: place.noticeCount },
    })),
  };
}

/** The smallest box holding every place, as `[[west, south], [east, north]]`; null without places. */
export function placesBounds(
  places: Pick<MapPoint, 'latitude' | 'longitude'>[],
): [[number, number], [number, number]] | null {
  if (places.length === 0) return null;
  const longitudes = places.map(place => place.longitude);
  const latitudes = places.map(place => place.latitude);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}

interface SourceFeature {
  geometry: GeoJSON.Geometry;
  properties: Record<string, unknown> | null;
}

/**
 * The markers to draw from the features MapLibre's clustered source holds at the current zoom.
 * A feature that spans several tiles comes back once per tile: it gets one marker.
 */
export function mapMarkers(features: SourceFeature[]): MapMarker[] {
  const markers = new Map<string, MapMarker>();
  for (const { geometry, properties } of features) {
    if (geometry.type !== 'Point' || !properties) continue;
    const [longitude, latitude] = geometry.coordinates;
    const noticeCount = Number(properties.noticeCount);
    const marker: MapMarker = properties.cluster
      ? {
          key: `cluster-${String(properties.cluster_id)}`,
          kind: 'cluster',
          clusterId: Number(properties.cluster_id),
          noticeCount,
          longitude,
          latitude,
        }
      : {
          key: `place-${String(properties.placeId)}`,
          kind: 'place',
          placeId: String(properties.placeId),
          noticeCount,
          longitude,
          latitude,
        };
    if (!markers.has(marker.key)) markers.set(marker.key, marker);
  }
  return [...markers.values()];
}

/**
 * Whether zooming out has merged a place into a group: it lies in view, where the map has drawn
 * its markers, but none of them is its own. Out of view, the map holds no marker to tell.
 */
export function hiddenInGroup(
  place: Pick<MapPoint, 'id' | 'latitude' | 'longitude'>,
  markers: MapMarker[],
  [[west, south], [east, north]]: [[number, number], [number, number]],
): boolean {
  const inView =
    place.longitude >= west &&
    place.longitude <= east &&
    place.latitude >= south &&
    place.latitude <= north;
  return (
    inView &&
    markers.length > 0 &&
    !markers.some(marker => marker.kind === 'place' && marker.placeId === place.id)
  );
}
