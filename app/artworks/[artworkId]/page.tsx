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

  try {
    const artwork = await getArtworkById(resolvedParams.artworkId);

    const artistNames = artwork.artists
      .map(a => `${a.artist.firstName} ${a.artist.lastName}`)
      .join(', ');

    const title = `${artwork.title}${artistNames ? ` - ${artistNames}` : ''} - ArtNote`;
    const description = artwork.notice
      ? artwork.notice.substring(0, 160) + '...'
      : `Découvrez cette œuvre${artistNames ? ` de ${artistNames}` : ''} sur ArtNote.`;

    // Get main image for OpenGraph
    const mainImage = artwork.images?.find(img => img.isMain) || artwork.images?.[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: artwork.publishedAt?.toISOString(),
        authors: [artwork.writer.name],
        images: mainImage?.image?.url
          ? [
              {
                url: mainImage.image.url,
                alt: mainImage.image.alt || artwork.title,
                width: mainImage.image.width || 1200,
                height: mainImage.image.height || 630,
              },
            ]
          : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: mainImage?.image?.url ? [mainImage.image.url] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Œuvre non trouvée - ArtNote',
      description: "Cette œuvre n'existe pas ou n'est plus disponible.",
    };
  }
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
