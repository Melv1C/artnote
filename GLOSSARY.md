# Glossary

Domain terms used in ArtNote's code, UI and docs. Code identifiers are English; the UI says the French word in parentheses.

- **Notice** (notice): the scholarly text about one painting, with its metadata, images, artists and place. Stored as the `Artwork` model, so code says `artwork` where it handles the record (`fetchMyArtworks`, `ArtworkForm`) and `notice` where it means the written piece or its readership (`noticeId` in analytics, "Mes Notices" in the dashboard). Treat the two words as the same thing.
- **Artwork** (œuvre): the painting a notice describes. Has no table of its own; see **Notice**.
- **Writer** (rédacteur): the admin who wrote a notice (`Artwork.writerId`). Only the writer can edit, publish or delete their notice. Public pages show the writer as an **Author**: name and avatar only.
- **Status**: `DRAFT` (brouillon, visible only to its writer), `PUBLISHED` (publié, public), `ARCHIVED` (archivé, hidden). `publishedAt` is set while a notice is published and cleared when it leaves publication.
- **Artist** (artiste): a painter credited on notices, through `ArtworkArtist`.
- **Place** (lieu): where a painting can be seen: a museum, church, public space or other.
- **Image legend / source**: per-notice caption and credit of an attached image (`ArtworkImage`), distinct from the image's own `alt` and `caption`.
- **Admin** / **user**: the two roles. Admins write notices and administer the site; users (lecteurs) only read published content. See `src/lib/permissions.ts`.
- **Visitor** / **session** (analytics): a visitor is the consented `visitor_id` cookie; a session is the in-memory id of one page load. Without consent, a visitor is counted by session.
- **Page view** / **notice view** (analytics): a page view is any route shown (`page_view_*` events, counted site-wide); a notice view is the time spent on a notice's public page (`notice_view_*` events, counted per notice).
- **View count**: `Artwork.viewCount`, a server-side counter of public notice page loads, deduplicated per visitor for 30 minutes. Separate from analytics events.
