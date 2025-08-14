import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Artwork, User } from '@/schemas';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Eye, ImageIcon, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface LatestArtworkCardProps {
  artwork: Artwork & {
    writer: User;
  };
}

export function LatestArtworkCard({ artwork }: LatestArtworkCardProps) {
  const {
    id,
    title,
    creationYear,
    medium,
    publishedAt,
    viewCount,
    images,
    writer,
    place,
    artists,
  } = artwork;

  // Get main image
  const mainImage = images?.find((img) => img.isMain) || images?.[0];

  // Get writer initials for avatar fallback
  const writerInitials = writer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/artworks/${id}`} className="block no-underline">
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card flex flex-row cursor-pointer">
        {/* Image Section - Now on the left */}
        <div className="relative w-1/3 min-w-[180px] overflow-hidden">
          {mainImage?.image ? (
            <Image
              src={mainImage.image.url}
              alt={mainImage.image.alt || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 33vw, (max-width: 1200px) 25vw, 20vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* View count badge */}
          <div className="absolute top-4 left-4">
            <Badge
              variant="secondary"
              className="bg-black/50 text-white border-0 backdrop-blur-sm"
            >
              <Eye className="h-3 w-3 mr-1" />
              {viewCount || 0}
            </Badge>
          </div>
        </div>

        {/* Content Section - Now on the right */}
        <CardContent className="p-6 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-xl font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {title}
              </h3>

              {/* Artists */}
              {artists && artists.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Par{' '}
                  {artists
                    .map((a) => a.artist.firstName + ' ' + a.artist.lastName)
                    .join(', ')}
                </p>
              )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-3">
                {creationYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{creationYear}</span>
                  </div>
                )}

                {place && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span className="line-clamp-1">{place.name}</span>
                  </div>
                )}
              </div>

              {medium && (
                <div className="text-xs bg-muted px-2 py-1 rounded-md inline-block mt-2">
                  {medium}
                </div>
              )}
            </div>
          </div>

          {/* Writer & Publication Info */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={writer.image || undefined}
                  alt={writer.name}
                />
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {writerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{writer.name}</span>
            </div>

            {publishedAt && (
              <div className="text-xs text-muted-foreground text-right">
                <div>Publié</div>
                <div>
                  {formatDistanceToNow(new Date(publishedAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
