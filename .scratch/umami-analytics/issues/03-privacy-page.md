# 03: Privacy page, cookie banner removed

**What to build:** A reader can open `/confidentialite` from the footer of every public page and read, in French, what ArtNote measures and how. The cookie banner no longer appears, and no consent or visitor-id cookie is set. Spec decisions 6 and 7. ADR 0010 records the accepted risk.

**Blocked by:** None

**Status:** done

- [ ] `/confidentialite` is a public page with its own page title and description. It covers:
  - Umami: cookieless, EU hosting, no personal data, Do Not Track honoured;
  - the view count: salted network-address hashes, counted once per 30 minutes, records deleted after a day;
  - the sign-in cookies, for signed-in accounts only.
- [ ] The footer of every public page links to it.
- [ ] The cookie banner is no longer rendered. Nothing sets the consent or visitor-id cookie.
- [ ] `bun run check` passes, including the routeTree change.
