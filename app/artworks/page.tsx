import { ArtworksFilter, ArtworksList, ArtworksListSkeleton } from '@/features/artworks/components';
import { Suspense } from 'react';

export const metadata = {
  title: 'ArtNote - Toutes les notices',
  description: "Explorez toutes les notices sur l'histoire de la peinture disponibles sur ArtNote.",
};

interface ArtworksPageProps {
  searchParams: Promise<{
    search?: string;
    artist?: string;
    place?: string;
    medium?: string;
    year?: string;
    sort?: 'title' | 'artist' | 'year' | 'published';
    order?: 'asc' | 'desc';
  }>;
}

export default function ArtworksPage({ searchParams }: ArtworksPageProps) {
  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="max-w-2xl mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Toutes les notices</h1>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ArtworksFilter />
      </div>

      {/* Artworks List */}
      <Suspense fallback={<ArtworksListSkeleton />}>
        <ArtworksList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
