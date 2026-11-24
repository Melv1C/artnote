import { Map as MapView, MapControls, MapMarker, MarkerContent, useMap } from '@/components/ui/map';
import type { MapPlace } from '@/schemas/place';
import type { GeoJSONSource } from 'maplibre-gl';
import { useEffect, useId, useMemo, useState } from 'react';
import {
  MAP_FIT,
  NOTICE_COUNT_CLUSTER_PROPERTIES,
  OPENFREEMAP_STYLES,
  mapMarkers,
  noticeCountLabel,
  placesBounds,
  placesToGeoJSON,
  type MapMarker as Marker,
} from '../lib/place-map';
import { BELGIUM_VIEW } from '../lib/place-position';

interface PlacesMapProps {
  places: MapPlace[];
}

/**
 * The public map of places: one marker per place with its number of published notices, nearby
 * places grouped when zoomed out. Opens fitted to every place. Loaded on demand and in the
 * browser only (`routes/carte.tsx`), as MapLibre is.
 */
export default function PlacesMap({ places }: PlacesMapProps) {
  const bounds = placesBounds(places);

  return (
    <MapView
      className="h-full"
      styles={OPENFREEMAP_STYLES}
      // Credits stay expanded: OpenFreeMap and OpenStreetMap must stay visible
      attributionControl={{ compact: false }}
      {...(bounds ? { bounds, fitBoundsOptions: MAP_FIT } : BELGIUM_VIEW)}
    >
      <MapControls position="top-right" />
      <PlaceMarkers places={places} />
    </MapView>
  );
}

/**
 * Markers drawn as HTML over the map, from MapLibre's clustered source: at each zoom, the
 * source says which places stand alone and which merge into a group with their notices added up.
 */
function PlaceMarkers({ places }: PlacesMapProps) {
  const { map, isLoaded } = useMap();
  const sourceId = `places-${useId()}`;
  const data = useMemo(() => placesToGeoJSON(places), [places]);
  const names = useMemo(() => new Map(places.map(place => [place.id, place.name])), [places]);
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    map.addSource(sourceId, {
      type: 'geojson',
      data,
      cluster: true,
      clusterRadius: 60,
      clusterProperties: NOTICE_COUNT_CLUSTER_PROPERTIES,
    });
    // MapLibre only computes a source's features for a layer that shows it: an invisible one
    map.addLayer({
      id: sourceId,
      type: 'circle',
      source: sourceId,
      paint: { 'circle-radius': 0, 'circle-opacity': 0 },
    });

    let shownKey = '';
    const update = () => {
      if (!map.isSourceLoaded(sourceId)) return;
      const next = mapMarkers(map.querySourceFeatures(sourceId));
      const key = next.map(marker => `${marker.key}@${marker.longitude},${marker.latitude}`).join();
      if (key === shownKey) return;
      shownKey = key;
      setMarkers(next);
    };
    map.on('render', update);
    update();

    return () => {
      map.off('render', update);
      setMarkers([]);
      // The map may already be gone, or its style swapped for the other theme
      if (map.getStyle()) {
        if (map.getLayer(sourceId)) map.removeLayer(sourceId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      }
    };
  }, [map, isLoaded, sourceId, data]);

  const zoomIntoGroup = async (marker: Extract<Marker, { kind: 'cluster' }>) => {
    const source = map?.getSource<GeoJSONSource>(sourceId);
    if (!map || !source) return;
    const zoom = await source.getClusterExpansionZoom(marker.clusterId);
    map.easeTo({ center: [marker.longitude, marker.latitude], zoom });
  };

  return markers.map(marker => (
    <MapMarker key={marker.key} longitude={marker.longitude} latitude={marker.latitude}>
      <MarkerContent>
        {marker.kind === 'cluster' ? (
          <button
            type="button"
            aria-label={`${noticeCountLabel(marker.noticeCount)} dans ce groupe de lieux, zoomer`}
            onClick={() => void zoomIntoGroup(marker)}
            className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-md ring-4 ring-primary/30 transition-transform hover:scale-110 focus-visible:ring-ring focus-visible:outline-none"
          >
            {marker.noticeCount}
          </button>
        ) : (
          <span
            role="img"
            aria-label={`${names.get(marker.placeId) ?? 'Lieu'} : ${noticeCountLabel(marker.noticeCount)}`}
            className="flex size-8 cursor-default items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-semibold text-primary-foreground shadow-md"
          >
            {marker.noticeCount}
          </span>
        )}
      </MarkerContent>
    </MapMarker>
  ));
}
