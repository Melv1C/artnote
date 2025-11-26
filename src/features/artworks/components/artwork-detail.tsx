'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextViewer } from '@/components/ui/rich-text-editor';
import { Separator } from '@/components/ui/separator';
import { Artwork, User } from '@/schemas';
import { Calendar, MapPin, Palette, Ruler } from 'lucide-react';
import { useRef } from 'react';
import { ArtworkImagesCarousel } from './artwork-images-carousel';
import { ArtworkImagesPreviewButton } from './artwork-images-preview-button';

interface ArtworkDetailProps {
  artwork: Artwork & {
    writer: User;
  };
}

export function ArtworkDetail({ artwork }: ArtworkDetailProps) {
  const { title, creationYear, medium, dimensions, notice, sources, writer, place, artists } =
    artwork;

  const carouselRef = useRef<HTMLElement>(null);

  // Get writer initials for avatar fallback
  const writerInitials = writer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="container py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 1. Title */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
            {title}
          </h1>

          {/* Artists */}
          {artists && artists.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {artists.map((artworkArtist, index) => (
                <div key={artworkArtist.artist.id} className="flex items-center">
                  <div className="text-lg md:text-xl text-muted-foreground">
                    {artworkArtist.artist.firstName} {artworkArtist.artist.lastName}
                    {artworkArtist.role && (
                      <span className="text-sm font-normal ml-1">({artworkArtist.role})</span>
                    )}
                  </div>
                  {index < artists.length - 1 && (
                    <span className="text-muted-foreground mx-2">•</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* 2. Images */}
        <ArtworkImagesCarousel ref={carouselRef} artwork={artwork} />

        <Separator />

        {/* 3. Infos */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Informations sur l'œuvre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {creationYear && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Année de création</div>
                      <div className="text-muted-foreground">{creationYear}</div>
                    </div>
                  </div>
                )}

                {medium && (
                  <div className="flex items-start gap-3">
                    <Palette className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Matériaux et Techniques</div>
                      <div className="text-muted-foreground">{medium}</div>
                    </div>
                  </div>
                )}

                {dimensions && (
                  <div className="flex items-start gap-3">
                    <Ruler className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Dimensions</div>
                      <div className="text-muted-foreground">{dimensions}</div>
                    </div>
                  </div>
                )}

                {place && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Lieu</div>
                      <div className="text-muted-foreground">
                        {place.name}
                        {place.city && place.country && (
                          <span className="block text-sm">
                            {place.city}, {place.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 4. Notice */}
        {notice && (
          <>
            <Separator />
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Notice</CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextViewer content={notice} />
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Sources */}
        {sources && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Bibliographie</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextViewer content={sources} />
              </CardContent>
            </Card>
          </section>
        )}

        <Separator />

        {/* 5. Author */}
        <section>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={writer.image || undefined} alt={writer.name} />
              <AvatarFallback className="text-sm bg-primary/10 text-primary">
                {writerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm text-muted-foreground">
              Notice rédigée par <span className="font-medium text-foreground">{writer.name}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Floating preview button */}
      <ArtworkImagesPreviewButton artwork={artwork} carouselRef={carouselRef} />
    </div>
  );
}
