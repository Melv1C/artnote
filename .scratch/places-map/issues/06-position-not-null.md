# 06: Position mandatory in the database

**What to build:** Once every place on staging and production has a position, the database makes latitude and longitude mandatory, and "Itinéraire" always uses the position, never a search by the place's name.

**Blocked by:** 01. Also blocked by a manual step: a writer has given every place on staging and production a position. Check both before starting: previews share staging's database, so the migration reaches it as soon as a branch deploys (ADR 0006).

**Status:** ready

- [ ] No place on staging or production lacks a position (checked before the PR).
- [ ] A migration makes latitude and longitude `NOT NULL`.
- [ ] The seed's place without a position gets one.
- [ ] The map link behind "Itinéraire" uses only the position; its unit test is updated.
- [ ] The "Sans position" badge and filter are removed, or kept only if still useful; knip reports nothing unused.
