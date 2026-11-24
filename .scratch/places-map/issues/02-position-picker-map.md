# 02: Map with a draggable marker in the place form

**What to build:** The place form shows a map, above the latitude and longitude fields, with one marker the writer can drag to set the position. Dragging the marker updates the numbers, and typing numbers moves the marker. The map opens on the place's position, or on Belgium when it has none, and follows the light or dark theme. This ticket brings in mapcn and MapLibre for every later map (ADR 0013).

**Blocked by:** 01

**Status:** ready

- [ ] mapcn is added through the shadcn CLI run with `vpx`; `maplibre-gl` is a dependency.
- [ ] Tiles come from OpenFreeMap: Positron in the light theme, Fiord in the dark theme, switching with the app theme.
- [ ] MapLibre's worker script is served by the app, not unpkg.
- [ ] The map renders on the client only and is loaded on demand: pages without a map don't load MapLibre.
- [ ] Dragging the marker and typing the numbers stay in sync both ways; saving keeps the dragged position.
- [ ] OpenFreeMap and OpenStreetMap credits are visible on the map.
- [ ] `vp run check` and `vp run test:e2e` pass, and existing place form e2e tests still type the position as numbers.
