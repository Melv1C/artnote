-- The seed's place without a position, in local databases seeded before this migration
UPDATE "place" SET "latitude" = 51.2049, "longitude" = 3.2248
WHERE "id" = 'seed-place-groeninge' AND ("latitude" IS NULL OR "longitude" IS NULL);

-- AlterTable
ALTER TABLE "place" ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL;
