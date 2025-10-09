'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { RichTextViewer } from '@/components/ui/rich-text-editor';
import { Artwork, User } from '@/schemas';
import Image from 'next/image';

interface ArtworkImagesCarouselProps {
  artwork: Artwork & {
    writer: User;
  };
}

export function ArtworkImagesCarousel({ artwork }: ArtworkImagesCarouselProps) {
  const images = artwork.images || [];

  if (images.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-muted-foreground">Aucune image disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {images.map((artworkImage, index) => (
            <CarouselItem key={artworkImage.id} className="flex items-center">
              <div className="w-full space-y-3 bg-muted p-4 rounded-lg">
                {/* Image */}
                <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-lg">
                  <Image
                    src={artworkImage.image.url}
                    alt={artworkImage.image.alt || artwork.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority={index === 0}
                  />
                </div>

                {/* Caption and source */}
                {artworkImage.source && (
                  <div className="space-y-2 text-sm">
                    {artworkImage.source && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Source
                        </span>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <RichTextViewer content={artworkImage.source} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </>
        )}
      </Carousel>
    </div>
  );
}
