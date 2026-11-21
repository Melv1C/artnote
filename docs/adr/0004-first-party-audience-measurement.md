---
status: superseded by ADR 0010
---

# First-party audience measurement with daily summaries

Audience figures come from our own beacon (`/api/analytics`) rather than a third-party analytics service: the audience is Belgian, so consent and data location matter, and the dashboard needs per-notice reading time, which generic tools do not give. The browser sends page and notice views; a persistent visitor id exists only after cookie consent. Vercel Cron summarises each day and week into summary tables, and raw events are deleted after 90 days, so the dashboard reads only summaries. The view count shown on notices is a separate server-side counter that keeps salted IP hashes, never raw addresses.
