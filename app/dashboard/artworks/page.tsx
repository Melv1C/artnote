import {
  ArtworkHeader,
  ArtworkList,
  ArtworkListSkeleton,
  ArtworkStats,
} from '@/features/artworks';
import {
  deleteArtwork,
  toggleArchiveArtwork,
} from '@/features/artworks/actions';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema } from '@/schemas';
import { Suspense } from 'react';

export default async function ArtworksPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ArtworkHeader />

        {/* Stats Cards */}
        <ArtworkStats />

        {/* Main Content with ArtworkList */}
        <div className="mt-8">
          <Suspense fallback={<ArtworkListSkeleton />}>
            <ArtworkListWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ArtworkListWrapper() {
  const user = await getRequiredUser();

  const initialArtworks = ArtworkSchema.array().parse(
    await prisma.artwork.findMany({
      where: {
        writerId: user.id,
      },
      orderBy: { updatedAt: 'desc' },
    })
  );

  return (
    <ArtworkList
      initialArtworks={initialArtworks}
      onArchiveToggle={toggleArchiveArtwork}
      onDelete={deleteArtwork}
    />
  );
}
