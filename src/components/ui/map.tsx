import type * as MapLibreGL from 'maplibre-gl';
import type { PopupOptions, MarkerOptions } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre's worker is served by the app, not unpkg (ADR 0013). The file is self-contained
// (maplibre-gl-shared.mjs is empty), so Vite can emit it alone as an asset.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from 'next-themes';
import { Minus, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { MAPLIBRE_FRENCH_LOCALE, withFrenchLabels } from '@/lib/map-french';

// The map primitive of the app, started from mapcn (https://mapcn.dev) and trimmed to what the
// places map and the position picker use.

type MapLibreModule = typeof MapLibreGL;

let maplibrePromise: Promise<MapLibreModule> | null = null;

function loadMapLibre() {
  maplibrePromise ??= import('maplibre-gl')
    .then(lib => {
      if (!lib.getWorkerUrl()) {
        lib.setWorkerUrl(maplibreWorkerUrl);
      }
      return lib;
    })
    .catch(error => {
      maplibrePromise = null;
      throw error;
    });
  return maplibrePromise;
}

/** OpenFreeMap's styles, following the app theme (ADR 0013). */
const MAP_STYLES = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/fiord',
};

type MapContextValue = {
  map: MapLibreGL.Map | null;
  mapLib: MapLibreModule | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMap must be used within a Map component');
  }
  return context;
}

function useMapLib() {
  const { mapLib } = useMap();
  if (!mapLib) {
    throw new Error('useMapLib must be used within a Map component');
  }
  return mapLib;
}

type MapProps = {
  children?: ReactNode;
  className?: string;
} & Omit<MapLibreGL.MapOptions, 'container' | 'style'>;

function MapLoader() {
  return (
    <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center">
      <div className="flex gap-1">
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" />
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" />
        <span className="bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

/**
 * A MapLibre map on OpenFreeMap's tiles, light or dark with the app theme, labelled in French.
 * The MapLibre options (`center`, `zoom`, `bounds`…) apply when the map is created.
 */
function Map({ children, className, ...props }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLib, setMapLib] = useState<MapLibreModule | null>(null);
  const [mapInstance, setMapInstance] = useState<MapLibreGL.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const [pendingStyle, setPendingStyle] = useState<string | null>(null);
  const currentStyleRef = useRef<string | null>(null);
  const { resolvedTheme } = useTheme();
  const style = resolvedTheme === 'dark' ? MAP_STYLES.dark : MAP_STYLES.light;

  // Reads the latest props and theme, not the first render's: MapLibre loads asynchronously
  const createMap = useEffectEvent((lib: MapLibreModule, container: HTMLDivElement) => {
    currentStyleRef.current = style;
    return new lib.Map({
      container,
      style,
      renderWorldCopies: false,
      // Credits stay expanded: OpenFreeMap and OpenStreetMap must stay visible
      attributionControl: { compact: false },
      // French for the map's own words and, where the tiles have them, its place names
      locale: MAPLIBRE_FRENCH_LOCALE,
      transformStyle: (_previous, next) => withFrenchLabels(next),
      ...props,
    });
  });

  useEffect(() => {
    let cancelled = false;
    let map: MapLibreGL.Map | undefined;

    loadMapLibre()
      .then(lib => {
        if (cancelled || !containerRef.current) return;

        const instance = createMap(lib, containerRef.current);
        // No painter means WebGL2 is unavailable
        if (!instance.painter) throw new lib.GPUInitializationError({}, null);
        map = instance;

        instance.on('load', () => setIsLoaded(true));
        instance.on('style.load', () => setIsStyleLoaded(true));

        setMapLib(lib);
        setMapInstance(instance);
      })
      // Rethrow during render so an error boundary catches it
      .catch(error => {
        if (cancelled) return;
        setMapInstance(() => {
          throw error;
        });
      });

    return () => {
      cancelled = true;
      if (!map) return;
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
  }, []);

  // Theme change: close the gate first (so layer children tear down and re-add on the incoming
  // style); the swap itself is staged to the effect below.
  useEffect(() => {
    if (!mapInstance || currentStyleRef.current === style) return;
    currentStyleRef.current = style;
    setIsStyleLoaded(false);
    setPendingStyle(style);
  }, [mapInstance, style]);

  useEffect(() => {
    if (!mapInstance || !pendingStyle) return;
    setPendingStyle(null);
    // Full reload (no diff) so `style.load` fires deterministically. A successful diff would
    // never fire it, leaving isStyleLoaded stuck false.
    mapInstance.setStyle(pendingStyle, { diff: false });
  }, [mapInstance, pendingStyle]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, mapLib, isLoaded: isLoaded && isStyleLoaded }),
    [mapInstance, mapLib, isLoaded, isStyleLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div ref={containerRef} className={cn('relative h-full w-full', className)}>
        {!isLoaded && <MapLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
}

const MarkerContext = createContext<MapLibreGL.Marker | null>(null);

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  /** The marker's look, as a `MarkerContent`. */
  children: ReactNode;
  /** Called when the writer drops a draggable marker. */
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
} & Omit<MarkerOptions, 'element'>;

/** A MapLibre marker; its options other than the position and `draggable` apply once, on creation. */
function MapMarker({
  longitude,
  latitude,
  children,
  onDragEnd,
  draggable = false,
  ...markerOptions
}: MapMarkerProps) {
  const { map } = useMap();
  const { Marker } = useMapLib();
  const [marker] = useState(() =>
    new Marker({
      ...markerOptions,
      element: document.createElement('div'),
      draggable,
    }).setLngLat([longitude, latitude]),
  );
  const handleDragEnd = useEffectEvent(() => {
    const { lng, lat } = marker.getLngLat();
    onDragEnd?.({ lng, lat });
  });

  useEffect(() => {
    if (!map) return;
    const onMarkerDragEnd = () => handleDragEnd();
    marker.on('dragend', onMarkerDragEnd);
    marker.addTo(map);
    return () => {
      marker.off('dragend', onMarkerDragEnd);
      marker.remove();
    };
  }, [map, marker]);

  useEffect(() => {
    const current = marker.getLngLat();
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
      marker.setDraggable(draggable);
    }
  }, [marker, longitude, latitude, draggable]);

  return <MarkerContext.Provider value={marker}>{children}</MarkerContext.Provider>;
}

/** What a `MapMarker` shows, rendered into the marker's element. */
function MarkerContent({ children, className }: { children: ReactNode; className?: string }) {
  const marker = useContext(MarkerContext);
  if (!marker) {
    throw new Error('MarkerContent must be used within MapMarker');
  }
  return createPortal(
    <div className={cn('relative cursor-pointer', className)}>{children}</div>,
    marker.getElement(),
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        'flex size-8 items-center justify-center transition-colors',
        'first:rounded-t-md last:rounded-b-md',
        'hover:bg-accent dark:hover:bg-accent/40',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset',
      )}
    >
      {children}
    </button>
  );
}

/** Zoom in and out buttons, at the map's top right. */
function MapControls() {
  const { map } = useMap();

  return (
    <div className={'absolute top-2 right-2 z-10 flex flex-col gap-1.5'}>
      <div className="border-border bg-background [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-md border shadow-sm [&>button:not(:last-child)]:border-b">
        <ControlButton
          onClick={() => map?.zoomTo(map.getZoom() + 1, { duration: 300 })}
          label="Zoomer"
        >
          <Plus className="size-4" />
        </ControlButton>
        <ControlButton
          onClick={() => map?.zoomTo(map.getZoom() - 1, { duration: 300 })}
          label="Dézoomer"
        >
          <Minus className="size-4" />
        </ControlButton>
      </div>
    </div>
  );
}

type MapPopupProps = {
  longitude: number;
  latitude: number;
  /** Called when MapLibre closes the popup, not when it unmounts. */
  onClose?: () => void;
  children: ReactNode;
  className?: string;
} & Omit<PopupOptions, 'className' | 'closeButton'>;

/** A MapLibre popup at a position; its options other than the position apply once, on creation. */
function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  ...popupOptions
}: MapPopupProps) {
  const { map } = useMap();
  const { Popup } = useMapLib();
  const [container] = useState(() => document.createElement('div'));
  const [popup] = useState(() =>
    new Popup({ offset: 16, ...popupOptions, closeButton: false })
      .setMaxWidth('none')
      .setLngLat([longitude, latitude]),
  );
  const handleClose = useEffectEvent(() => onClose?.());

  useEffect(() => {
    if (!map) return;
    const onPopupClose = () => handleClose();
    popup.on('close', onPopupClose);
    popup.setDOMContent(container);
    popup.addTo(map);
    return () => {
      // Removing the popup fires 'close' too: stop listening first
      popup.off('close', onPopupClose);
      popup.remove();
    };
  }, [map, popup, container]);

  useEffect(() => {
    const current = popup.getLngLat();
    if (current.lng !== longitude || current.lat !== latitude) {
      popup.setLngLat([longitude, latitude]);
    }
  }, [popup, longitude, latitude]);

  return createPortal(
    <div
      className={cn(
        'bg-popover text-popover-foreground relative max-w-62 rounded-md border p-3 shadow-md',
        'animate-in fade-in-0 zoom-in-95 duration-200 ease-out',
        className,
      )}
    >
      {children}
    </div>,
    container,
  );
}

export { Map, useMap, MapMarker, MarkerContent, MapPopup, MapControls };
