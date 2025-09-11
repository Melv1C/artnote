'use client';

import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
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
            <CarouselItem key={artworkImage.id}>
              <div className="relative group cursor-pointer">
                <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={artworkImage.image.url}
                    alt={artworkImage.image.alt || artwork.title}
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority={index === 0}
                  />
                </div>

                {/* Image source/caption */}
                {(artworkImage.source || artworkImage.image.caption) && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {artworkImage.image.caption && (
                      <p className="mb-1">{artworkImage.image.caption}</p>
                    )}
                    {artworkImage.source && <p className="italic">Source: {artworkImage.source}</p>}
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
