/** OpenFreeMap's styles, following the app theme (ADR 0013). */
export const OPENFREEMAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/fiord',
};

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
