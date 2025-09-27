import { getArtworkById, incrementArtworkViewCount } from '@/features/artworks/actions';
import { ArtworkDetail } from '@/features/artworks/components';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

interface ArtworkPageProps {
  params: Promise<{
    artworkId: string;
  }>;
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  const artwork = await getArtworkById(resolvedParams.artworkId);
  if (!artwork) {
    return { title: 'Œuvre non trouvée | ArtNote' };
  }
  return {
    title: `${artwork.title} | ArtNote`,
    description: artwork.notice
      ? artwork.notice.substring(0, 160)
      : `Découvrez l'œuvre "${artwork.title}" sur ArtNote`,
  };
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const resolvedParams = await params;
  const headersList = await headers();

  try {
    const artwork = await getArtworkById(resolvedParams.artworkId);

    if (!artwork) {
      notFound();
    }

    // Increment view count asynchronously (don't await to avoid blocking page render)
    incrementArtworkViewCount(
      resolvedParams.artworkId,
      undefined, // sessionId - could be implemented with cookies
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined,
      headersList.get('user-agent') || undefined,
      headersList.get('referer') || undefined,
    ).catch(viewError => {
      console.error('Failed to increment view count:', viewError);
    });

    return <ArtworkDetail artwork={artwork} />;
  } catch {
    notFound();
  }
}
