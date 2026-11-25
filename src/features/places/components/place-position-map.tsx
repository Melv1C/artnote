import { Map, MapMarker, MarkerContent, useMap } from '@/components/ui/map';
import { MapPin } from 'lucide-react';
import type { MapMouseEvent } from 'maplibre-gl';
import { useEffect } from 'react';
import { BELGIUM_VIEW, POSITION_ZOOM, type PlacePosition } from '../lib/place-position';

interface PlacePositionMapProps {
  /** The position the latitude and longitude fields hold, or null when they hold none. */
  position: PlacePosition | null;
  /** Called when the writer drags the marker or clicks the map. */
  onChange: (position: PlacePosition) => void;
  /** A position to fly to and zoom in on, such as an address search result; each new one moves the map. */
  focus?: PlacePosition | null;
}

/** The pin's width and height, in pixels. */
const PIN_HEIGHT = 32;
/** The margin, in pixels, a followed marker keeps from the map's edges. */
const EDGE = 16;
/**
 * The least zoom the map comes to when it follows typed numbers: the town around the position,
 * not yet the streets of POSITION_ZOOM, as each digit typed moves the marker.
 */
const FOLLOW_ZOOM = 10;

/**
 * The map of the place form: one marker on the place's position, which the writer drags (or
 * clicks the map) to move. Without a position it opens on Belgium and shows no marker until the
 * writer clicks. Loaded on demand and in the browser only (`place-form.tsx`), as MapLibre is.
 */
export default function PlacePositionMap({ position, onChange, focus }: PlacePositionMapProps) {
  return (
    <Map
      className="h-72 overflow-hidden rounded-md border sm:h-80"
      {...(position
        ? { center: [position.longitude, position.latitude], zoom: POSITION_ZOOM }
        : BELGIUM_VIEW)}
    >
      <ClickToPlace onChange={onChange} />
      <FollowPosition position={position} />
      <FlyToFocus focus={focus} />
      {position && (
        <MapMarker
          draggable
          anchor="bottom"
          longitude={position.longitude}
          latitude={position.latitude}
          onDragEnd={({ lng, lat }) => onChange({ latitude: lat, longitude: lng })}
        >
          <MarkerContent className="cursor-grab active:cursor-grabbing">
            <MapPin
              aria-hidden
              size={PIN_HEIGHT}
              className="fill-primary stroke-primary-foreground drop-shadow-md"
            />
          </MarkerContent>
        </MapMarker>
      )}
    </Map>
  );
}

/** A click on the map puts the marker there. */
function ClickToPlace({ onChange }: Pick<PlacePositionMapProps, 'onChange'>) {
  const { map } = useMap();

  useEffect(() => {
    if (!map) return;
    const handleClick = ({ lngLat, originalEvent }: MapMouseEvent) => {
      // A click on the marker itself (or the end of its drag) is not a click on the map
      if (
        originalEvent.target instanceof Element &&
        originalEvent.target.closest('.maplibregl-marker')
      )
        return;
      onChange({ latitude: lngLat.lat, longitude: lngLat.lng });
    };
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onChange]);

  return null;
}

/** When typed numbers put the marker out of view or against an edge, bring it to the middle. */
function FollowPosition({ position }: Pick<PlacePositionMapProps, 'position'>) {
  const { map } = useMap();
  const latitude = position?.latitude;
  const longitude = position?.longitude;

  useEffect(() => {
    if (!map || latitude === undefined || longitude === undefined) return;
    // The pin stands above its point: keep room for it at the top, and a margin elsewhere
    const { x, y } = map.project([longitude, latitude]);
    const { clientWidth: width, clientHeight: height } = map.getContainer();
    if (x >= EDGE && x <= width - EDGE && y >= PIN_HEIGHT + EDGE && y <= height - EDGE) return;
    map.easeTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), FOLLOW_ZOOM) });
  }, [map, latitude, longitude]);

  return null;
}

/** Fly to each new focus, at the zoom a place opens at, so the writer checks the spot. */
function FlyToFocus({ focus }: Pick<PlacePositionMapProps, 'focus'>) {
  const { map } = useMap();

  useEffect(() => {
    if (!map || !focus) return;
    map.flyTo({ center: [focus.longitude, focus.latitude], zoom: POSITION_ZOOM });
  }, [map, focus]);

  return null;
}
