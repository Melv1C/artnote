import {
  ArtworkHeader,
  ArtworkListAdmin,
  ArtworkListSkeleton,
  ArtworkStats,
} from '@/features/artworks';
import { changeArtworkStatus, deleteArtwork } from '@/features/artworks/actions';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtworkSchema } from '@/schemas';
import { Suspense } from 'react';

export default async function ArtworksPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <ArtworkHeader />

      {/* Stats Cards */}
      <ArtworkStats />

      {/* Main Content with ArtworkList */}
      <div>
        <Suspense fallback={<ArtworkListSkeleton />}>
          <ArtworkListWrapper />
        </Suspense>
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
      include: {
        images: {
          include: {
            image: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        place: true,
        artists: {
          include: {
            artist: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
  );

  return (
    <ArtworkListAdmin
      initialArtworks={initialArtworks}
      onDelete={deleteArtwork}
      onStatusChange={changeArtworkStatus}
    />
  );
}
