# ArtNote

ArtNote publishes scholarly notices about paintings for a French-speaking (Belgian) audience: writers prepare notices, readers browse and read the published ones.

## Content

**Notice**:
The scholarly text about one painting, with its metadata, images, credited artists and place. The central thing ArtNote publishes. In code it is the `Artwork` record (see ADR 0001).
_Avoid_: Artwork (for the text), article, entry, fiche

**Artwork**:
The painting a notice describes. It exists only through its notice.
_Avoid_: Œuvre (in code), painting record

**Artist**:
A painter credited on one or more notices, with a role on each.
_Avoid_: Author (reserved for the writer's public face), painter

**Place**:
Where a painting can be seen: a museum, a church, a public space or another site.
_Avoid_: Location, venue, museum (a museum is one kind of place)

**Image**:
An uploaded picture of a painting, reusable across notices.
_Avoid_: Photo, media

**Image attachment**:
An image placed on a notice, with its position, whether it is the main image, its legend and its source credit.
_Avoid_: Notice image, gallery item

**Legend**:
The caption an image attachment carries on one notice. Distinct from the image's own alternative text.
_Avoid_: Caption (for the attachment)

## Publication

**Status**:
Where a notice is in its life: draft, published or archived.

**Draft**:
A notice not yet public; its writer works on it and any admin can preview it.
_Avoid_: Unpublished, pending

**Published**:
A notice readers can find and read. Its publication date is the first time it was published since it last left publication.

**Archived**:
A notice withdrawn from the public that its writer keeps.
_Avoid_: Deleted, hidden

**Preview**:
An admin's view of any notice exactly as readers would see it, whatever its status.

## People

**Writer**:
The admin who wrote a notice. Only the writer edits, publishes, archives or deletes it.
_Avoid_: Owner, creator, rédacteur (in code)

**Author**:
The public face of a writer on a notice: name and avatar, nothing else.
_Avoid_: Writer (for the public view), user

**Admin**:
A role that writes notices, manages artists and places, and administers users.
_Avoid_: Editor, staff, content manager

**Reader**:
Anyone reading published notices, signed in with the user role or not.
_Avoid_: Visitor (reserved for analytics), lecteur (in code)

## Audience measurement

**Visitor**:
One browser that accepted analytics cookies, recognised across visits. Without consent, each session counts as its own visitor.
_Avoid_: User, reader (in analytics)

**Session**:
One page load of the site and the navigation that follows, until the tab is closed or reloaded. Not a sign-in.
_Avoid_: Visit, login session

**Page view**:
A reader seeing any page, timed from arrival to departure.
_Avoid_: Hit, impression

**Notice view**:
A reader spending time on a notice's page, measured per notice.
_Avoid_: Notice page view

**View count**:
The running number of times a notice's page was opened, counted at most once per network address every 30 minutes. Separate from page views and notice views; the records kept to deduplicate it are not page views either.
_Avoid_: Views (unqualified), hits

**Daily summary** / **weekly summary**:
The audience figures of one day or one week, for the whole site or one notice, kept after the individual page and notice views are discarded.
_Avoid_: Report, aggregate
