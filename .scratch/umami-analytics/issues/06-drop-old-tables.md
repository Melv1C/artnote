# 06: Drop the old analytics tables

**What to build:** The database no longer carries the first-party analytics tables. Earlier figures survive only in Melvyn's CSV archive.

**Blocked by:** 05

**Status:** done

- [ ] Before the migration, Melvyn has exported the daily notice summaries and daily site summaries from production to CSV.
- [ ] A migration drops `AnalyticsEvent`, `NoticeDailySummary`, `NoticeWeeklySummary`, `SiteDailySummary` and `SiteWeeklySummary`, and the schema no longer declares them.
- [ ] No deployed branch still reads those tables when the migration reaches the shared preview database (ADR 0006).
- [ ] `vp run check` passes, and `vp run db:reset` works locally.
