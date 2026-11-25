import {
  Map as MapView,
  MapControls,
  MapMarker,
  MapPopup,
  MarkerContent,
  useMap,
} from '@/components/ui/map';
import { useIsMobile } from '@/hooks/use-mobile';
import type { MapPlace } from '@/schemas/place';
import type { GeoJSONSource } from 'maplibre-gl';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  hiddenInGroup,
  MAP_FIT,
  NOTICE_COUNT_CLUSTER_PROPERTIES,
  mapMarkers,
  noticeCountLabel,
  placesBounds,
  placesToGeoJSON,
  type MapMarker as Marker,
} from '../lib/place-map';
import { BELGIUM_VIEW } from '../lib/place-position';
import { PlaceDetails } from './place-details';

interface PlacesMapProps {
  places: MapPlace[];
}

/**
 * The public map of places: one marker per place with its number of published notices, nearby
 * places grouped when zoomed out. Opens fitted to every place. Clicking a place shows its details,
 * in a bubble next to it, or in a panel at the bottom of the screen on phones. Loaded on demand
 * and in the browser only (`routes/carte.tsx`), as MapLibre is.
 */
export default function PlacesMap({ places }: PlacesMapProps) {
  const bounds = placesBounds(places);
  const isMobile = useIsMobile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = places.find(place => place.id === selectedId);
  const panelRef = useRef<HTMLElement>(null);

  // Closing the details gives focus back to the place's marker, as a dialog would
  const close = useCallback(() => {
    setSelectedId(null);
    if (selectedId) markerButton(selectedId)?.focus();
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedId, close]);

  // On phones the panel covers the bottom of the map: focus moves into it
  useEffect(() => {
    if (selectedId && isMobile) panelRef.current?.focus();
  }, [selectedId, isMobile]);

  return (
    <div className="relative h-full">
      <MapView
        className="h-full"
        {...(bounds ? { bounds, fitBoundsOptions: MAP_FIT } : BELGIUM_VIEW)}
      >
        <MapControls position="top-right" />
        <PlaceMarkers places={places} selected={selected} onSelect={setSelectedId} />
        {selected && !isMobile && (
          <MapPopup
            // A new bubble for each place, so closing one never closes the next
            key={selected.id}
            longitude={selected.longitude}
            latitude={selected.latitude}
            offset={22}
            closeOnClick={false}
            onClose={close}
            className="w-72 max-w-72 p-0"
          >
            <PlaceDetails place={selected} onClose={close} />
          </MapPopup>
        )}
      </MapView>
      {selected && isMobile && (
        <PlaceDetails
          ref={panelRef}
          place={selected}
          onClose={close}
          className="absolute inset-x-0 bottom-0 z-10 max-h-[70%] overflow-y-auto rounded-t-xl border-t bg-popover text-popover-foreground shadow-[0_-8px_24px_-12px_oklch(0.2_0.02_288/0.35)] animate-in fade-in-0 slide-in-from-bottom-4"
        />
      )}
    </div>
  );
}

/**
 * Markers drawn as HTML over the map, from MapLibre's clustered source: at each zoom, the
 * source says which places stand alone and which merge into a group with their notices added up.
 */
function PlaceMarkers({
  places,
  selected,
  onSelect,
}: PlacesMapProps & {
  selected: MapPlace | undefined;
  onSelect: (placeId: string | null) => void;
}) {
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

  // Its marker has gone into a group: no bubble left pointing at nothing
  useEffect(() => {
    if (!map || !selected) return;
    const view = map.getBounds().toArray() as [[number, number], [number, number]];
    if (hiddenInGroup(selected, markers, view)) onSelect(null);
  }, [map, selected, markers, onSelect]);

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
          <button
            type="button"
            aria-label={`${names.get(marker.placeId) ?? 'Lieu'} : ${noticeCountLabel(marker.noticeCount)}`}
            aria-expanded={marker.placeId === selected?.id}
            data-place-id={marker.placeId}
            onClick={() => onSelect(marker.placeId)}
            className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-semibold text-primary-foreground shadow-md transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-expanded:scale-125 aria-expanded:ring-4 aria-expanded:ring-primary/30"
          >
            {marker.noticeCount}
          </button>
        )}
      </MarkerContent>
    </MapMarker>
  ));
}

/** A place's marker button, by the `data-place-id` PlaceMarkers gives it, to give it focus back. */
function markerButton(placeId: string) {
  return document.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(placeId)}"]`);
}
