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

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const resolvedParams = await params;
  const headersList = await headers();

  try {
    const artwork = await getArtworkById(resolvedParams.artworkId);

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
