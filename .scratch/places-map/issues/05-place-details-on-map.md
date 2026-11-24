# 05: Place details on the map

**What to build:** Clicking a place on the map shows its name, its type (in French), its city, "N notices", and its first three published notices, newest first, each with its main image and title and linking to its notice page. When the place has more than three, "Voir les N notices" links to the notices list filtered by the place's name. On phones the details open as a panel at the bottom of the screen; on larger screens as a bubble next to the marker.

**Blocked by:** 04

**Status:** ready

- [ ] The map's server function also returns each place's first three published notices (id, title, main image), ordered by publication date, newest first, through the public schemas.
- [ ] Singular and plural are right ("1 notice", "N notices").
- [ ] "Voir les N notices" appears only above three notices and opens the notices list filtered by the place.
- [ ] On phones (the existing mobile breakpoint) the details are a bottom panel; otherwise a bubble.
- [ ] e2e: opening a place lists its notices and a link opens the notice page; a phone-sized test sees the bottom panel.
