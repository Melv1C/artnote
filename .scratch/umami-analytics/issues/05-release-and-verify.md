# 05: Release and verify in production

**What to build:** Production measures its audience in Umami. Set `UMAMI_WEBSITE_ID` (`3a00b639-0a6f-497b-9d03-96101b15fd8d`) in Vercel's Production environment only, then release with a version tag (ADR 0009) once Melvyn gives the go.

**Blocked by:** 04

**Status:** ready

- [ ] `UMAMI_WEBSITE_ID` is set for Production only. Preview and Development have none.
- [ ] Melvyn approves the merge to `main` and the `vX.Y.Z` tag. The Release workflow moves `production`.
- [ ] On production, `/stats/script.js` serves Umami's script, and page views of public pages arrive in Umami.
- [ ] Visiting `/dashboard` and a preview sends nothing.
- [ ] Reading a notice and leaving it sends `notice_read` with the right bracket.
- [ ] Countries in Umami match readers, not Vercel's location. If they don't, open a follow-up about forwarding the client's address through the proxy.
- [ ] The next nightly prune cron run succeeds (Vercel cron logs).
- [ ] The Vercel token shared in the planning conversation is revoked.
