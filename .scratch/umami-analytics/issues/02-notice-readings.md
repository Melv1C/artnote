# 02: Notice readings

**What to build:** When a reader leaves a notice's page or hides the tab, Umami receives one `notice_read` event carrying the notice id, its title (cut to 100 characters) and the reading-time bracket. The event is recorded against the notice's URL, not the page the reader moved to. Spec decision 5.

**Blocked by:** 01

**Status:** done

- [ ] The public notice page sends exactly one `notice_read` per reading, timed from arrival until leaving or hiding the tab, whichever comes first.
- [ ] The event's URL is the notice's path, even when it is sent after navigation to another page.
- [ ] Previews send no `notice_read`.
- [ ] Nothing throws when Umami is blocked or missing.
- [ ] `vp run check` passes.
