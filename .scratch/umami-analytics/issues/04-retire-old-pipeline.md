# 04: Retire the old analytics pipeline

**What to build:** Admins find a "Voir les statistiques" link to Umami on the dashboard home, beside the content figures. The first-party pipeline of ADR 0004 is gone from the code, and the only remaining cron prunes the view count's deduplication records. The old tables stay, unused, until ticket 06 (ADR 0006). Spec decisions 8 to 10.

**Blocked by:** 01, 02, 03

**Status:** done

- [ ] The dashboard home keeps the content figures (users, published notices) and replaces the analytics section with a link that opens Umami's dashboard in a new tab. Its loader no longer reads analytics.
- [ ] Deleted:
  - the beacon endpoint;
  - the event payload schema, event recording, aggregation and summary queries, and their tests;
  - the old browser tracker, analytics provider, timed-view hook and `useNoticeViewTracking` (the view count's `useRecordNoticeView` stays);
  - the dashboard analytics charts.
- [ ] A nightly cron at `/api/cron/prune-view-records` prunes the view count's records through the existing cron handler and `CRON_SECRET`. Vercel's cron configuration lists only this cron.
- [ ] `ua-parser-js` is removed if nothing else uses it, and knip reports nothing.
- [ ] `AGENTS.md` describes the new measurement: the Analytics section, the feature list, and the cron and env notes.
- [ ] No Prisma migration. The models stay.
- [ ] `vp run check` passes. In the local app, signed in as `admin@example.com`, the dashboard home renders without errors.
