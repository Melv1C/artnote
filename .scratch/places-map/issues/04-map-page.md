# 04: The map page with places and their number of notices

**What to build:** Readers open "Carte" from the site navigation and see, at `/carte`, every place that has a position and at least one published notice. Each place's marker shows its number of published notices. Nearby places merge into a bubble showing the total of their notices when zoomed out, and clicking a bubble zooms in on it. The map opens fitted to all places, fills the screen below the header on phones, and follows the theme. The privacy page says the map loads its images from OpenFreeMap, which receives the reader's IP address.

**Blocked by:** 02

**Status:** ready

- [ ] A public server function returns places with a position and at least one notice matching the published filter, each with its public fields and its number of published notices; it is listed on purpose among the public server functions in the server function test.
- [ ] `/carte` has its own page title and description, its loader only reads, and the reader navigation has a "Carte" entry.
- [ ] Markers show the number of published notices in the primary colour; groups add up notices, not places, and zoom in on click.
- [ ] The opening view fits all markers with padding and a maximum zoom.
- [ ] `/confidentialite` has a paragraph on the map and OpenFreeMap.
- [ ] e2e: the seed's published places appear with the right counts; a place whose only notice is a draft is absent; "Carte" in the navigation opens the map. Tiles failing to load does not fail the tests.
