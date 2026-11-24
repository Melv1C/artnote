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

**Position**:
The point on the map where a place is, given by its latitude and longitude. Every place has one.
_Avoid_: Coordinates, location, geo

**Map**:
The public page that shows each place with at least one published notice at its position, with how many published notices it has.
_Avoid_: Plan, carte (in code)

**Image**:
An uploaded picture of a painting, reusable across notices.
_Avoid_: Photo, media

**Image attachment**:
An image placed on a notice, with its position, whether it is the main image, its legend and its image source.
_Avoid_: Notice image, gallery item

**Legend**:
The caption an image attachment carries on one notice. Distinct from the image's own alternative text.
_Avoid_: Caption (for the attachment)

**Image source**:
The reference to where an image attachment's picture was taken from, written as a citation (author, title, address, date consulted).
_Avoid_: Credit, source credit, photo credit

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
One browser as the audience tool recognises it, without a cookie, over a limited period. Not a person and not a reader account.
_Avoid_: User, reader (in analytics)

**Visit**:
A visitor's run of page views without a long pause. Not a sign-in.
_Avoid_: Session, login

**Page view**:
A visitor opening any public page. Dashboard pages and previews are not measured.
_Avoid_: Hit, impression

**Notice reading**:
A visitor leaving a notice's page, recorded with the notice and how long they stayed, as a reading-time bracket.
_Avoid_: Notice view, notice page view

**Reading-time bracket**:
The span a notice reading falls in: under 30 seconds, 30 seconds to under 2 minutes, 2 to under 5 minutes, 5 minutes or more.
_Avoid_: Duration, dwell time

**View count**:
The running number of times a notice's page was opened, counted at most once per network address every 30 minutes. Separate from page views and notice readings; the records kept to deduplicate it are not page views either.
_Avoid_: Views (unqualified), hits
