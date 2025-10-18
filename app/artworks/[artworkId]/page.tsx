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
    return { title: 'ArtNote - Œuvre non trouvée' };
  }
  return {
    title: `ArtNote - ${artwork.title}`,
    description: `Découvrez la notice scientifique de "${artwork.title}" par ${artwork.artists.map(artist => `${artist.artist.firstName} ${artist.artist.lastName}`).join(', ')}.`,
    openGraph: {
      images: artwork.images.filter(image => image.isMain).length
        ? artwork.images
            .filter(image => image.isMain)
            .map(image => ({
              url: image.image.url,
              width: image.image.width || undefined,
              height: image.image.height || undefined,
              alt: artwork.title,
            }))
        : [
            {
              url: '/og-image.png',
              width: 1200,
              height: 630,
              alt: 'ArtNote - La peinture dans tout son art',
            },
          ],
    },
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
