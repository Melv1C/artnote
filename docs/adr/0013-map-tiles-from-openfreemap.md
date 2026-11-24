---
status: accepted
---

# Map tiles come from OpenFreeMap

The map and the position picker draw their background with MapLibre (through mapcn), from OpenFreeMap's vector tiles: the Positron style in the light theme, Fiord in the dark theme. OpenFreeMap needs no key or account, sets no usage cap and allows any use, and it is open source: the same tiles and styles can be hosted on our own server later without changing how the map looks. MapLibre's worker script is served by the app, so OpenFreeMap is the only third party a reader's browser contacts for the map.

## Considered options

- **CARTO** (mapcn's default): the same Positron design and a company behind it, but its free basemaps are meant for non-commercial use under a monthly cap, and leaving it means changing styles.
- **Self-hosted Protomaps tiles in MinIO**: no third party at all, but a large file, fonts and sprites to host and update; kept as the way out if OpenFreeMap stops or privacy demands it.

## Consequences

- **Readers' IP addresses reach OpenFreeMap** when they open the map: the privacy page says so.
- **OpenFreeMap is run by one person on donations.** If it goes away, the way out is self-hosting the same styles, not another provider.
- **Address search uses Nominatim from the server**, only when an admin searches in the place form, so readers never contact it.
