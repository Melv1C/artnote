# Notices are stored as `Artwork` records

The central record is a notice, but the table and model are named `Artwork`, from the first version of the app when one painting had one page. Renaming the table, its relations and every analytics column (`noticeId` already points at it) is a data migration on the shared databases for no behaviour change, so we keep `Artwork` in code and say "notice" in the UI, the glossary and analytics. Code that handles the record says `artwork`; code that means the written text or its readership says `notice`.
