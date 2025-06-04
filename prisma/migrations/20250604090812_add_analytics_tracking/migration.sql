-- AlterTable
ALTER TABLE "artwork" ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "page_view" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_view_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_view_artworkId_idx" ON "page_view"("artworkId");

-- CreateIndex
CREATE INDEX "page_view_createdAt_idx" ON "page_view"("createdAt");

-- AddForeignKey
ALTER TABLE "page_view" ADD CONSTRAINT "page_view_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "artwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;
