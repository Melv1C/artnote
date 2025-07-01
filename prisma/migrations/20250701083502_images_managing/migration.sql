/*
  Warnings:

  - You are about to drop the column `createdAt` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `isMain` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `image` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `image` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `artwork_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `artwork_image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedById` to the `artwork_image` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_createdById_fkey";

-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_updatedById_fkey";

-- AlterTable
ALTER TABLE "artwork_image" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "source" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "image" DROP COLUMN "createdAt",
DROP COLUMN "createdById",
DROP COLUMN "isMain",
DROP COLUMN "updatedAt",
DROP COLUMN "updatedById";

-- AddForeignKey
ALTER TABLE "artwork_image" ADD CONSTRAINT "artwork_image_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artwork_image" ADD CONSTRAINT "artwork_image_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
