import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Artwork, User } from '@/schemas';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Eye, ImageIcon, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ArtworkCardProps {
  artwork: Artwork & {
    writer: User;
  };
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
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
  const mainImage = images?.find(img => img.isMain) || images?.[0];

  // Get writer initials for avatar fallback
  const writerInitials = writer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Link href={`/artworks/${id}`} className="block no-underline">
      <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card flex flex-col sm:flex-row cursor-pointer">
        {/* Image Section - Responsive layout */}
        <div className="relative w-full h-48 sm:w-1/3 sm:h-auto sm:min-w-[180px] md:min-w-[220px] overflow-hidden">
          {mainImage?.image ? (
            <Image
              src={mainImage.image.url}
              alt={mainImage.image.alt || title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-muted">
              <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
            </div>
          )}

          {/* Overlay gradient - responsive direction */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* View count badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
            <Badge
              variant="secondary"
              className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3 mr-1" />
              {viewCount || 0}
            </Badge>
          </div>
        </div>

        {/* Content Section - Responsive padding and spacing */}
        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold line-clamp-2 mb-1 sm:mb-2 group-hover:text-primary transition-colors leading-tight">
                {title}
              </h3>

              {/* Artists */}
              {artists && artists.length > 0 && (
                <p className="text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
                  Par {artists.map(a => a.artist.firstName + ' ' + a.artist.lastName).join(', ')}
                </p>
              )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
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
                  <span className="line-clamp-1">{medium}</span>
                </div>
              )}
            </div>
          </div>

          {/* Writer & Publication Info */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={writer.image || undefined} alt={writer.name} />
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
