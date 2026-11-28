# Places map

Readers, signed in or not, see at `/carte` a full-screen map of the places that have a position and at least one published notice. Each place is a round marker showing its number of published notices; nearby places merge into a group marker when zoomed out. Clicking a place opens its details: a bubble beside the marker on desktop, a full-width panel above the tab bar on a phone. The details list the place's type and city, its count and up to 3 newest notices.

## Sub-features

- `map-markers` one button per place named "<place> : <n notice(s)>"; places with only drafts or without a position are left out.
- `map-group` zoomed out, nearby places become one button "<n> notices dans ce groupe de lieux, zoomer"; clicking it zooms in.
- `map-details` a place's details are `region "<place>"` with `button "Fermer"`, `heading` the place name, "<type> · <city>", "<n> notice(s)" and links to up to 3 notices (newest first), plus "Voir les N notices" (to `/artworks?place=<name>`) when it has more. Escape or "Fermer" closes them and puts focus back on the marker.
- `map-phone` below 768px the details are a bottom panel above the tab bar and focus moves into it.

## How to get to it (user POV)

- "Carte" in the header navigation "Navigation principale" (desktop) or in the bottom tab bar of the same name (phone), from any public page.

## Driving it with playwright-cli

Preconditions:

- Baseline from the README. No sign-in needed: `S=$($C session reader)`, `E=$($C evidence places-map)`.
- `playwright-cli -s=$S open "$U/"`, `resize 1280 800`, `set-reduced-motion reduce` (map animations otherwise make zoom clicks overshoot).

- **Open the map.** `click "getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Carte' })"`. `location.pathname` is `/carte`; the hidden `heading "Carte des lieux"` and `region "Carte"` are in the snapshot. Markers appear once the map style has loaded: poll `find "Saint-Bavon"` until it shows a `button`.
- **Markers.** Exactly two place buttons: "Musées royaux des Beaux-Arts de Belgique : 2 notices" and "Cathédrale Saint-Bavon : 1 notice"; none for "Musée Magritte Museum" (draft only) or "Musée Groeninge" (no position). Save snapshot and screenshot.
- **Details (desktop).** `click "getByRole('button', { name: 'Musées royaux des Beaux-Arts de Belgique : 2 notices' })"`. `region "Musées royaux des Beaux-Arts de Belgique"` holds "Musée · Bruxelles", "2 notices", links "Le Dénombrement de Bethléem" then "Paysage avec la chute d’Icare", and no "Voir les" link. `press Escape`: the region is gone and `eval "document.activeElement.dataset.placeId"` is `seed-place-fine-arts`.
- **Group.** `click "getByRole('button', { name: 'Dézoomer' })"` until a button `/dans ce groupe de lieux/` appears (about 5 clicks at 1280×800); it reads "3 notices dans ce groupe de lieux, zoomer". Click it: the two place markers come back.
- **Phone.** `resize 390 844`, `goto "$U/carte"`, wait for the markers, `click "getByRole('button', { name: 'Cathédrale Saint-Bavon : 1 notice' })"`. `region "Cathédrale Saint-Bavon"` is the active element and holds "Église · Gand", "1 notice" and `link "L’Adoration de l’Agneau mystique"`; the screenshot shows the panel full width above the tab bar ("Accueil", "Notices", "Carte", "À propos"). Click the notice link: the URL becomes `/artworks/seed-artwork-lamb`. `resize 1280 800` afterwards.

## Gotchas

- The map draws OpenFreeMap tiles from `tiles.openfreemap.org`, so it needs the internet. Offline, markers never appear: stub the style the way `e2e/map.spec.ts` does, with `route "https://tiles.openfreemap.org/**"` returning `{"version":8,"sources":{},"layers":[]}` before `goto`, and report the tile background as not verified.
- It also needs WebGL. Headless Chrome has it; if the page says "La carte ne peut pas s’afficher sur cet appareil.", report an environment problem, not a pass.
- Marker names use a plain colon with spaces and `plural` ("1 notice", "2 notices").
- Both navigations are named "Navigation principale"; only one is visible at a time.
- After a `resize`, re-open the details: a desktop bubble that is already open does not move into the phone panel.
- In dev, the TanStack Query devtools button ("Open Tanstack query devtools") sits in the bottom-right corner, over the "À propos" tab on a phone; it is not part of the app.
- The empty state ("Aucun lieu à afficher pour le moment.") needs a database with no qualifying place; it is not reachable on the seed.
