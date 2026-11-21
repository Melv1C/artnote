# 01: Umami page views on public pages

**What to build:** Wherever the Umami website id is configured, every public page sends a page view to Umami Cloud through our own domain under `/stats/`. Query strings are excluded and Do Not Track is honoured. Dashboard pages and notice previews send nothing. Without the id, no script loads and nothing is sent. Spec: `.scratch/umami-analytics/spec.md`, decisions 1 to 4. ADR 0010.

**Blocked by:** None

**Status:** done

- [ ] The env schema accepts an optional Umami website id (a UUID). The env schema test covers it present, absent and invalid.
- [ ] A public server function exposes the website id to the root layout, and it is listed in the server function test's public list.
- [ ] The root layout renders Umami's script only when the id is set, served from `/stats/script.js`, sending to `/stats/api/send`, with automatic page views off (`data-auto-pageview="false"`), query strings excluded and Do Not Track honoured.
- [ ] The proxy is declared in Nitro's config (route rules), not `vercel.json`: `/stats/script.js` to `https://cloud.umami.is/script.js`, and `/stats/api/send` to `https://gateway.umami.is/api/send`.
- [ ] Each change of public path sends one page view through Umami's tracker, decided by `isMeasuredPath`. Dashboard and preview paths send none. Nothing throws when Umami is blocked or missing.
- [ ] A new pure module in the analytics feature's `lib/` holds `isMeasuredPath`, `readingTimeBracket` and `noticeReadingEvent` (spec, "New pure module"), all unit-tested, including `/confidentialite` as a measured path and the exact bracket boundaries.
- [ ] On the PR's preview deployment, `/stats/script.js` returns Umami's script.
- [ ] Only if Melvyn approves the short preview test: with the id set on the preview deployment, page views appear in Umami and the dashboard sends none.
- [ ] `bun run check` passes.
