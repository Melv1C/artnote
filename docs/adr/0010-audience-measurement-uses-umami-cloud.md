---
status: accepted
supersedes: ADR 0004
---

# Audience measurement uses Umami Cloud

ADR 0004's own pipeline (beacon, raw event table, nightly and weekly crons, summary tables, in-app charts) cost about 2,000 lines to rebuild a commodity tool and still lacked bot filtering and rate limiting. Audience figures now come from Umami Cloud's free Hobby plan (EU region): cookieless, with notice readings sent as a custom event, and the script and endpoint proxied through our own domain so ad-blockers do not drop them. Only production is measured, and only public pages.

## Considered options

- **Keep our own pipeline**: full control, but we maintain everything and it is weaker than the tool it imitates.
- **Self-hosted Umami**: no quota or retention limit, but another app and database to run for a small audience.
- **PostHog, Cloudflare and Vercel Web Analytics**: heavier than needed, no custom events, or custom events behind a paid plan, respectively.

## Consequences

- **No cookie banner.** Belgium's data protection authority (APD/GBA) grants no consent exemption for audience measurement. We accept that risk because Umami stores nothing on the device and keeps no personal data; the privacy page discloses it and Do Not Track is honoured. If the APD's position or our risk appetite changes, the fix is loading Umami only after consent.
- **Limits of the free plan**: about 100k events a month and 6 months of retention. Earlier figures were not imported.
- **The view count is unaffected**: it stays a server-side counter, and one nightly cron remains to prune its deduplication records.
