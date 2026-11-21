-- Birth and death dates become free text ("1950", "vers 1525", "XIXe siècle").
-- New columns rather than a type change, so the code on main keeps working
-- against the shared staging database (ADR 0006). The old date columns are
-- dropped in a later release.
ALTER TABLE "artist" ADD COLUMN     "birthDateText" TEXT,
ADD COLUMN     "deathDateText" TEXT;

-- Keep each date as the dashboard showed it (fr-FR, DD/MM/YYYY)
UPDATE "artist" SET
  "birthDateText" = to_char("birthDate", 'DD/MM/YYYY'),
  "deathDateText" = to_char("deathDate", 'DD/MM/YYYY');
