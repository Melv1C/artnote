# Move audience measurement to Umami Cloud

**Status:** qa

Decided in ADR 0010, which supersedes ADR 0004. Terms follow `GLOSSARY.md`: visitor, visit, page view, notice reading, reading-time bracket, view count.

## Problem Statement

The admins of ArtNote want to know how readers use the site: how many visitors come, which pages they open, which notices they read and for how long. Today ArtNote measures this with a pipeline of its own:

- a beacon endpoint,
- a table of raw events,
- nightly and weekly crons that summarise them,
- summary tables,
- a set of charts in the dashboard.

It works, but:

- **Too much code to maintain.** It is about 2,000 lines that rebuild a tool anyone can get for free.
- **Polluted figures.** Bots are not filtered out, and anyone can post fake events to the open endpoint, which also grows the database.
- **Misleading figures.**
  - A "session" is really one page load.
  - Unique visitors are only those who accepted cookies.
  - Admin work in the dashboard is counted alongside readers.
  - Figures appear only the next day.
- **A cookie banner** that interrupts every new reader.

## Solution

Audience measurement moves to Umami Cloud's free Hobby plan, hosted in the EU.

- **What Umami measures:** page views on public pages, plus a notice reading each time a reader leaves a notice, tagged with the notice and a reading-time bracket.
- **Reading the figures:** admins open them in Umami's interface, from a link on the dashboard home.
- **No banner:** Umami is cookieless, so the cookie banner disappears. A new privacy page explains what is measured.
- **Code and crons:** the pipeline, its crons and its charts are deleted. The only cron left prunes the view count's deduplication records.
- **View count:** the count shown on notices is unchanged.
- **Database:** the old tables are dropped in a later, separate change, once nothing deployed reads them.

## User Stories

1. As an admin, I want a "Voir les statistiques" link on the dashboard home, so that I reach the audience figures in one click.
2. As an admin, I want to see page views and visitors over any period in Umami, so that I can follow the site's audience.
3. As an admin, I want to see which notices readers read most, so that I know which subjects interest them.
4. As an admin, I want to see how long readers stay on each notice, as reading-time brackets, so that I can tell skimmed notices from read ones.
5. As an admin, I want notice readings identified by the notice's title as well as its id, so that the Umami report is readable without looking ids up.
6. As an admin, I want a notice's readings to stay grouped by its id even after its title changes, so that renaming does not split its figures.
7. As an admin, I want referrers, countries, devices and browsers broken down, so that I know where readers come from and what they use.
8. As an admin, I want bot traffic filtered out, so that the figures reflect people.
9. As an admin, I want figures in near real time, so that I can see the effect of sharing a notice the same day.
10. As an admin, I want my own dashboard work and notice previews left out of the figures, so that they measure readers only.
11. As an admin, I want staging, preview deployments and local development left out of the figures, so that only production traffic counts.
12. As an admin, I want the dashboard home to keep its content figures (published notices and the rest), so that I still see the state of the catalogue at a glance.
13. As an admin, I want the view count on each notice to keep working as before, so that the public figure readers see does not change.
14. As a reader, I want to read notices without a cookie banner, so that nothing stands between me and the text.
15. As a reader, I want no cookie or identifier stored in my browser for audience measurement, so that I am not tracked across visits.
16. As a reader who has turned on Do Not Track, I want my browser's choice honoured, so that I am not measured at all.
17. As a reader, I want a privacy page in French that says what is measured, by whom, where it is hosted, and how my network address is used for the view count, so that I can trust the site.
18. As a reader, I want a link to the privacy page in the footer of every public page, so that I can find it.
19. As a reader whose ad-blocker blocks third-party analytics, I want the site to keep working normally, so that measurement never breaks reading.
20. As an admin, I want readers with ad-blockers counted as far as possible, so that the figures are not skewed against them.
21. As a reader, I want the query strings of the URLs I visit left out of what is sent, so that search terms are not collected.
22. As a developer, I want the old beacon endpoint, crons, summary code and charts deleted, so that there is less code to maintain.
23. As a developer, I want the rules for which pages are measured and how a notice reading is described kept in one pure, tested module, so that a change to them is caught by tests.
24. As a developer, I want the Umami website id read from the environment configuration, so that only the environment that sets it sends figures.
25. As a developer, I want the old analytics tables kept until the change is released, so that other deployments sharing the preview database keep working (ADR 0006).
26. As Melvyn, I want to export the daily summaries to CSV before the old tables are dropped, so that the earlier figures are archived.
27. As a developer, I want `AGENTS.md`, the glossary and the ADRs to describe the new measurement, so that the next agent or developer works from the right picture.

## Implementation Decisions

**Umami setup.**

- **Plan:** one Umami Cloud website for the production domain, on the free Hobby plan in the EU region. Traffic is low, so the quota (about 100k events a month) is not a concern. Retention is 6 months.
- **No Umami API.** Umami's API requires the paid Pro plan, so there is no in-app chart or "top notices" card and no API key.
- **Website id:** an optional environment variable in the env schema. It is set in production only; where it is missing, no script is rendered.

**Script delivery.**

- **First-party URLs:** proxy rules declared in Nitro's route rules (which become Vercel rewrites; `vercel.json` rewrites may be ignored for a Nitro build) serve Umami's script (from `cloud.umami.is`) and its collect endpoint (`gateway.umami.is`) under `/stats/` on our own domain, so ad-blockers that block Umami's domains still let them through.
- **Tracker options:**
  - query strings excluded,
  - Do Not Track honoured,
  - automatic page views off (`data-auto-pageview="false"`): the tracker still follows client-side page changes, but page views are sent manually through `isMeasuredPath`.
- **Where it loads:** the root layout renders the script once.

**Which pages are measured.**

- **Excluded:** dashboard pages and notice previews.
- **Mechanism:** the decision is made by a pure function, and the tracker sends page views manually through it rather than relying on blanket auto-tracking.

**New pure module (`analytics` feature, `lib/`).** No React, no DOM, no network. It exposes:

- `isMeasuredPath(path)`: true for public pages, false for the dashboard and notice previews. It replaces today's page categorisation.
- `readingTimeBracket(durationMs)`: returns one of `<30s`, `30s–2min`, `2–5min`, `>5min`.
- `noticeReadingEvent({ noticeId, title, durationMs })`: returns the `notice_read` event name and its data `{ noticeId, title, bracket }`. The title is truncated to a fixed length.

**Notice reading tracking.**

- **When:** a hook on the notice page times the reading from arrival until the reader leaves the page or hides the tab, then sends `notice_read` once through Umami's tracker.
- **Timing:** it reuses today's timing approach (start on mount; end on visibility hidden or unmount, whichever comes first).
- **Failures:** if Umami is missing (blocked, or not configured), it does nothing and never throws.

**Privacy page and cookie banner.**

- **New public route `/confidentialite`,** in French, linked from the footer. It covers:
  - Umami: cookieless, EU hosting, Do Not Track,
  - the view count: salted network-address hashes, 30-minute deduplication, records pruned nightly,
  - the sign-in cookies.
- **Cookie banner:** deleted, with its consent cookie and visitor-id cookie logic.

**Dashboard home.**

- **Kept:** the content figures, which come from our database.
- **Replaced:** the whole analytics section becomes a link to the Umami dashboard.
- **Simplified:** the dashboard's loader no longer reads analytics.

**View count and cron.**

- **Unchanged:** `Artwork.viewCount` and its recording.
- **Schedule:** the two aggregation crons are replaced by one nightly cron that only prunes view-count deduplication records. It reuses the existing cron handler and `CRON_SECRET` check. Vercel's cron configuration lists only this cron.

**Deletions.**

- **Endpoint and summaries:** the beacon endpoint, the event payload schema, the event recording, the aggregation functions, the summary queries.
- **Browser side:** the browser tracker and the analytics provider.
- **Dashboard:** the dashboard analytics charts.
- **Dependency:** the user-agent parsing dependency, if nothing else uses it.
- **Docs:** `AGENTS.md`'s Analytics section and its feature list are rewritten to match.

**Schema (two steps, ADR 0006).**

- **PR 1:** no migration. The `AnalyticsEvent` model and the 4 summary models stay, unused.
- **Between the PRs:** after PR 1 is released to production, Melvyn exports the daily summaries to CSV.
- **PR 2:** a migration drops the 5 tables and their models.

## Testing Decisions

**What a good test is here.** It checks a module's external behaviour through its public functions, with plain inputs and outputs:

- no database,
- no DOM,
- no mocks of Umami or `window`,
- no assertions about how the result is computed.

**One main seam: the new pure analytics module.** Its unit test covers:

- `isMeasuredPath`:
  - true: home, notices, about, privacy page, unknown public paths;
  - false: dashboard and its subpages, notice previews;
  - trailing slashes and letter case handled.
- `readingTimeBracket`: each bracket, plus the exact boundaries (29,999 ms, 30,000 ms, 120,000 ms, 300,000 ms; each lower bound belongs to the longer bracket, so 120,000 ms is `2–5min`), zero, and very long readings.
- `noticeReadingEvent`: the event name, the data shape, and title truncation.

**Existing seams that cover the rest:**

- **Server function test:** it fails any server function without a guard or validator, so it keeps covering what remains.
- **Cron secret test:** it already covers the check the pruning cron reuses.
- **Env schema test:** it gains cases for the optional website id.
- **View count test:** it stays as it is.

**Prior art:** the page-categorisation tests in the analytics feature are the model for `isMeasuredPath`. The view count and filter tests in other features show the style.

**Deleted:** the aggregation and event-payload tests, along with their code.

**Not unit-tested:** the hook and the script tag, which are thin wrappers. Verify them in a browser on a preview deployment with the website id set temporarily:

- page views appear in Umami under `/stats/`;
- the dashboard and previews send nothing;
- `notice_read` arrives with its bracket;
- Do Not Track suppresses everything.

## Out of Scope

- Importing earlier figures into Umami. They are only archived to CSV.
- In-app analytics charts or cards fed by Umami. That needs the paid API.
- A consent banner gating Umami. The legal risk is accepted (ADR 0010).
- Self-hosting Umami.
- Changes to the view count or how it deduplicates.
- Measuring the dashboard, staging, previews or local development.
- Click or outbound-link tracking beyond Umami's defaults.
- Dropping the old tables. That is PR 2, after the release.

## Further Notes

- **Legal:** Belgium's data protection authority (APD/GBA) gives no consent exemption for audience measurement. ADR 0010 records the decision to go without a banner, and the fallback: load Umami only after consent.
- **Account:** already created on the Hobby plan, which confirmed that API access requires Pro.
- **Retention:** 6 months on Hobby. Anything older is visible only in the CSV archive.
- **Glossary:** already updated (visit, notice reading, reading-time bracket; summaries removed). The spec uses those terms.

## Comments

2026-11-21: Every ticket is `done` (#161 to #165, released as v1.2.0), so the spec moves to `qa`. It becomes `done` once Melvyn approves.
