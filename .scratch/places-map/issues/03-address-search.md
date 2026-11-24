# 03: Address search in the place form

**What to build:** Above the map in the place form, a writer types an address or a place name and clicks "Rechercher" (or presses Enter). Up to five results appear, each with its full address. Picking one sets the position, moves the marker, and fills in address, city and country only where those fields are empty. When nothing is found or the search fails, a French message says so and the writer can still place the marker by hand.

**Blocked by:** 02

**Status:** ready

- [ ] A dashboard-only server function, guarded by the place management permission, takes a bounded search text and returns at most five results (label, position, optional address, city, country); the server function test sees its guard.
- [ ] It calls Nominatim's search API from the server with the User-Agent `ArtNote (https://artnote.melvyn.be)`, French as preferred language, address details, and a short timeout; no email is sent. A failure throws a French error; no result is an empty list.
- [ ] A pure function turns Nominatim's response into results (city from city, town, village or municipality; street from house number and road), unit-tested on a recorded sample response, including missing fields and an empty list.
- [ ] A pure function applies a chosen result to the form: always sets the position, fills address, city and country only when empty; unit-tested.
- [ ] The search runs only on the button or Enter, never while typing.
- [ ] No test calls Nominatim.
