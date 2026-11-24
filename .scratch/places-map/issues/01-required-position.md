# 01: Required position and "Sans position" in the places list

**What to build:** A writer can no longer save a place without a position: the place form refuses a missing latitude or longitude with a French message saying the position is missing. In the dashboard places list, every place without a position shows a "Sans position" badge, and a filter shows only those places, combined with the existing search and type filters. No map yet: the position is typed as numbers. The seed places get positions, and the seed adds one place without a position for the filter.

**Blocked by:** None

**Status:** ready

- [ ] The place form schema requires both latitude and longitude, keeps their ranges, and its schema test covers a missing value, a full position and out-of-range values.
- [ ] The places filter accepts a "missing position" flag; the place `where` builder maps it to "latitude or longitude is missing", and its unit test covers it alone and combined with search and type.
- [ ] The places table shows a "Sans position" badge on those rows, and its toolbar has the matching filter.
- [ ] The seed gives its places positions and adds one place without a position.
- [ ] e2e: saving a place without a position shows the error; typing a position saves it and its "Sans position" badge goes away; the filter lists only places without a position.
