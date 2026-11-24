# Show places on a map

**Status:** ready

Terms follow `GLOSSARY.md`: place, position, map, notice, published, writer, reader. Tiles are decided in ADR 0013.

## Problem Statement

Readers can't see where the paintings ArtNote writes about can be seen. Each notice names its place in the "Où voir l'œuvre" card, but nothing shows the places together, how close they are to each other, or which ones have the most notices to read.

The data can't support a map today. A place's latitude and longitude are optional number fields that a writer would have to look up and type by hand, so most places have only a name. The "Itinéraire" button then searches Google Maps for that name and can land on the wrong building when the name is common ("Église Saint-Martin").

## Solution

Two steps, in this order:

1. **Every place gets a position.** The place form gets an address search and a map with a marker the writer can drag. A position becomes required when a place is created or edited. The dashboard places list shows which existing places still lack one, so writers can fill them in.
2. **A public map.** A new "Carte" page shows each place that has at least one published notice, at its position, with its number of published notices. Clicking a place shows its first notices and a link to all of them.

Once every place on staging and production has a position, the database makes it mandatory, and "Itinéraire" always uses the position.

## User Stories

### Writers: setting a place's position

1. As a writer, I want to search for an address or a place name in the place form, so that I don't have to look up latitude and longitude myself.
2. As a writer, I want to see a list of search results with their full address, so that I can choose the right one when several places share a name.
3. As a writer, I want picking a result to set the place's position and move the map to it, so that I can check it is the right spot.
4. As a writer, I want picking a result to fill in the address, city and country when those fields are empty, so that I don't retype them.
5. As a writer, I want picking a result to leave the address, city and country I already typed unchanged, so that a search never overwrites my own wording.
6. As a writer, I want to drag the marker on the map, so that I can correct a position the search got slightly wrong (the entrance of a church, the right wing of a museum).
7. As a writer, I want the latitude and longitude to stay visible and editable as numbers, so that I can paste exact values from another source.
8. As a writer, I want the form to refuse to save a place without a position, with a clear French message, so that every new place can appear on the map.
9. As a writer, I want editing an existing place without a position to ask me for one before saving, so that old places get fixed as they are touched.
10. As a writer, I want a clear message when the search finds nothing or fails, so that I know to try other words or place the marker by hand.
11. As a writer, I want the search to run only when I click "Rechercher", so that typing doesn't trigger searches I don't need.
12. As a writer, I want the map in the form to follow the light or dark theme, so that it matches the rest of the dashboard.
13. As a writer, I want the map in the form to open on the place's current position when it has one, so that I see where it is before changing anything.

### Writers: finding places without a position

14. As a writer, I want a "Sans position" badge on each place that has no position in the places list, so that I can see which places are missing from the map.
15. As a writer, I want to filter the places list to only the places without a position, so that I can fill them in one after the other.
16. As a writer, I want that filter to combine with the existing search and type filters, so that I can work one city or one type at a time.

### Readers: the map

17. As a reader, I want a "Carte" entry in the site navigation, so that I can find the map from any public page.
18. As a reader, I want the map to show every place that has at least one published notice, so that I see everywhere ArtNote can send me.
19. As a reader, I want each place's marker to show how many published notices it has, so that I can see at a glance where there is the most to read.
20. As a reader, I want nearby places to merge into one bubble when I zoom out, showing the total number of their published notices, so that the map stays readable over Belgium.
21. As a reader, I want clicking a merged bubble to zoom in on its places, so that I can reach a single place.
22. As a reader, I want the map to open fitted to all the places, so that I see everything without searching for it.
23. As a reader, I want clicking a place to show its name, its type and its city, so that I know what it is.
24. As a reader, I want clicking a place to show "N notices" and its first three notices with their main image and title, so that I can choose what to read.
25. As a reader, I want each of those notices to link to its notice page, so that I can read it in one tap.
26. As a reader, I want a "Voir les N notices" link when a place has more than three notices, so that I can see them all in the notices list.
27. As a reader on a phone, I want the map to fill the screen below the header, so that I can use it comfortably.
28. As a reader on a phone, I want a place's details in a panel at the bottom of the screen instead of a bubble over the map, so that they stay readable and easy to tap.
29. As a reader on a computer, I want a place's details in a bubble next to its marker, so that I keep the map in view.
30. As a reader, I want the map to follow the light or dark theme, so that it matches the site.
31. As a reader, I want to zoom and pan with my fingers or mouse, so that I can explore a city.
32. As a reader, I don't want to see places whose notices are all drafts or archived, so that the map never sends me to a place with nothing to read.
33. As a reader, I want the map's sources credited (OpenFreeMap, OpenStreetMap), so that the data is properly attributed.

### Readers: privacy

34. As a reader, I want the privacy page to say that the map loads its images from OpenFreeMap, which receives my IP address, so that I know which third parties my browser contacts.
35. As a reader, I want pages without a map to contact no map service, so that reading a notice involves no extra third party.

### Readers: directions

36. As a reader, I want "Itinéraire" to use the place's position, so that directions always lead to the right building.

### Admins: operations

37. As an admin, I want address searches to come from our server, identified as ArtNote, so that we respect Nominatim's usage policy and readers' browsers never contact it.
38. As an admin, I want the position to become mandatory in the database only once every place has one, so that the migration never fails on staging or production (ADR 0006).

## Implementation Decisions

### Position and the place schema

- `latitude` and `longitude` stay two nullable columns on the place for now. The place form schema makes them both required, keeping the existing ranges (−90 to 90, −180 to 180). The French messages say the position is missing, not that a number is invalid.
- The public and dashboard place schemas are unchanged: they already carry both fields.
- A later migration makes both columns `NOT NULL`. It runs only once every place on staging and production has a position, and it removes the name-based fallback from the map link behind "Itinéraire".

### Address search (geocoding)

- A new dashboard-only server function, guarded by `requirePermission({ place: ['manage'] })`, takes a bounded search text (`SearchTextSchema`) and returns at most five results. Each result has a label, a position, and optional address, city and country.
- It calls Nominatim's search API from the server, with a User-Agent of `ArtNote (https://artnote.melvyn.be)`, French as the preferred language, and address details requested. No email address is sent.
- A failed or slow call (with a short timeout) throws a French error. An empty result is an empty list, not an error.
- The transformation of Nominatim's response into search results is a pure function in the places feature's `lib/`. It picks the city from the first of city, town, village or municipality, and builds the street address from house number and road.
- Applying a chosen result to the form is a pure function: it sets the position and fills address, city and country only where they are empty.
- The search runs only when the writer clicks "Rechercher" (or presses Enter in the search field), never as they type.

### Map components and tiles

- mapcn is added through the shadcn CLI run with `vpx`. It installs `maplibre-gl` and puts the map component under the UI components, which knip skips.
- Tiles come from OpenFreeMap: Positron in the light theme, Fiord in the dark theme, switching with the app theme (ADR 0013).
- MapLibre's worker script is served by the app, not unpkg, as mapcn's documentation describes.
- MapLibre only runs in the browser. Every map is rendered on the client only and loaded on demand, so MapLibre stays out of the bundle of pages without a map.
- Credits for OpenFreeMap and OpenStreetMap stay visible on every map.

### Position picker in the place form

- A search field, a "Rechercher" button and a result list, above a map with one draggable marker, above the latitude and longitude number fields. The three stay in sync: picking a result or dragging the marker updates the numbers, and typing numbers moves the marker.
- Without a position, the map opens on Belgium. With one, it opens on the position.

### Places list: missing position

- The places filter schema gains an optional "missing position" flag. `buildPlaceWhere` maps it to "latitude or longitude is null", combined with the existing filters.
- The places table shows a "Sans position" badge on those rows, and its toolbar gets a matching filter.

### The map page

- A new public route at `/carte`, with its own page title and description, and a "Carte" entry in the reader navigation.
- A new public server function, added on purpose to the list of public server functions in the server function test, returns the places to show:
  - only places with both latitude and longitude, and at least one notice that matches `publishedWhere`;
  - for each place: its public fields (through `PublicPlaceSchema`), its number of published notices, and its first three published notices ordered by publication date, newest first, each with id, title and main image.
- The page's loader calls it (reads only).
- Grouping uses MapLibre's built-in clustering, which adds up each place's number of notices, so a group shows the total of its notices, not its number of places. Clicking a group zooms in on it.
- Each marker shows its number of published notices in the primary colour.
- The opening view fits all markers, with padding and a maximum zoom, so a single place doesn't open at street level.
- The details of a place show its name, type (in French), city, "N notices" (singular and plural), its first three notices (main image thumbnail and title, each linking to its notice page), and, when there are more than three, "Voir les N notices", linking to the notices list filtered by the place's name. On phones (the existing `useIsMobile` breakpoint) this is a bottom panel; on larger screens it is a bubble next to the marker.
- The map fills the space below the header on phones.

### Privacy page

- `/confidentialite` gets a paragraph on the map: it loads its images from OpenFreeMap, which receives the reader's IP address like any website does, and only on the map page.

### Analytics

- `/carte` is a public page that `isMeasuredPath` already accepts, so it gets Umami page views like other public pages. No new event is added.

## Testing Decisions

A good test checks behaviour a reader or writer can see, or a pure function's input and output. It never checks MapLibre internals, the DOM structure of the map, or calls to Nominatim. No test touches the network: Nominatim is never called, and OpenFreeMap tiles failing to load in tests must not fail them.

**Unit tests (Vitest, next to the code in `lib/`)**
- `buildPlaceWhere` with the missing-position flag, alone and combined with search and type. Prior art: `place-filters.test.ts`.
- The Nominatim response transformation: full address; city from town or village; missing house number; missing fields; an empty list. It uses a recorded sample response as a fixture.
- Applying a result to the form: fills only empty fields and always sets the position.
- The place form schema: refuses a missing latitude or longitude with the French message, accepts a full position, and keeps the range checks. Prior art: `schemas.test.ts`.

**End-to-end tests (Playwright, `e2e/`)**
- Place form: saving a place without a position shows the error. Typing a latitude and longitude saves it, and the places list no longer shows "Sans position" for it.
- Places list: the "Sans position" filter shows only places without a position. The seed needs at least one place without a position for this.
- Map: `/carte` shows the seed's published places with the right number of notices. A place whose only notice is a draft doesn't appear. Opening a place shows its notices, and one link opens the notice page. A phone-sized test checks that the details open as a bottom panel. Prior art: `reading.spec.ts`, `phone.spec.ts`.
- Navigation: "Carte" is in the reader navigation and opens the map.
- Server function test: the new public function is listed, and the geocoding function has its guard.

## Out of Scope

- A small map in the "Où voir l'œuvre" card on the notice page (the "b" option); "Itinéraire" stays as it is apart from preferring the position.
- Filters on the map (artist, place type, period, search).
- A public page per place, and a place filter by id in the notices list (the "Voir les N notices" link uses the existing name filter, which matches by "contains").
- Self-hosted tiles (Protomaps in MinIO), kept as the way out in ADR 0013.
- The reader's own location ("près de moi") and directions inside the app.
- Making the position `NOT NULL` in the database before every existing place has one.

## Further Notes

- **Order:** the tickets in `issues/` ship the position first (01 to 03: required position, map picker, address search), then the map (04, 05). Ticket 06, the `NOT NULL` migration, waits until a writer has filled in every place on staging and production. Previews share staging's database (ADR 0006), so the migration must not ship while any place there lacks a position.
- **Name-only matching:** the "Voir les N notices" link filters by place name with "contains", so a place named "Musée" also catches "Musée des Beaux-Arts". Accepted for this version.
- **OpenFreeMap terms:** check its current terms before release. The way out if they change is in ADR 0013.
- **Seed:** give the seed places positions, and add one place without a position for the filter test. Issue 3 gives that place a position, since `NOT NULL` would refuse it.
