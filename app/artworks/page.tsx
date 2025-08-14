import { ArtworksFilter } from '@/components/artworks/artworks-filter';
import { ArtworksList } from '@/components/artworks/artworks-list';
import { ArtworksSearchSkeleton } from '@/components/artworks/artworks-search-skeleton';
import { Suspense } from 'react';

export const metadata = {
  title: 'Toutes les œuvres - ArtNote',
  description:
    "Explorez toutes les notices d'œuvres d'art publiées sur ArtNote.",
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
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Toutes les œuvres
        </h1>
        <p className="text-lg text-muted-foreground">
          Explorez notre collection complète de notices d'œuvres d'art. Utilisez
          les filtres pour trouver exactement ce que vous cherchez.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <ArtworksFilter />
      </div>

      {/* Artworks List */}
      <Suspense fallback={<ArtworksSearchSkeleton />}>
        <ArtworksList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
