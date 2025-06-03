/*
  Warnings:

  - You are about to drop the column `references` on the `artwork` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `artwork_image` table. All the data in the column will be lost.
  - Changed the type of `status` on the `artwork` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `place` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/

-- Drop old enum columns and create new TEXT columns with defaults
ALTER TABLE "artwork" 
  DROP COLUMN "references",
  DROP COLUMN "status",
  ADD COLUMN "sources" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

ALTER TABLE "place" 
  DROP COLUMN "type",
  ADD COLUMN "type" TEXT NOT NULL DEFAULT 'OTHER';

ALTER TABLE "user" 
  DROP COLUMN "role",
  ADD COLUMN "role" TEXT NOT NULL DEFAULT 'VIEWER';

-- Update artwork_image column
ALTER TABLE "artwork_image" 
  DROP COLUMN "order",
  ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;


-- AlterTable
ALTER TABLE "artwork" ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "place" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;


-- Drop the enum types
DROP TYPE IF EXISTS "ArtworkStatus";
DROP TYPE IF EXISTS "PlaceType"; 
DROP TYPE IF EXISTS "UserRole";
