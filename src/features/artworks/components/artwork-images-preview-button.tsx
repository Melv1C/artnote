'use client';

import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Artwork, User } from '@/schemas';
import { ImageIcon, Minus, Plus, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface ArtworkImagesPreviewButtonProps {
  artwork: Artwork & {
    writer: User;
  };
  carouselRef: React.RefObject<HTMLElement | null>;
}

export function ArtworkImagesPreviewButton({
  artwork,
  carouselRef,
}: ArtworkImagesPreviewButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const images = artwork.images || [];

  useEffect(() => {
    const element = carouselRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show button when carousel is NOT in view
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0.1, // Consider visible if 10% is showing
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [carouselRef]);

  // Don't render if no images
  if (images.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 size-14 rounded-full shadow-lg transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        size="icon"
        aria-label="Voir les images de l'œuvre"
      >
        <ImageIcon className="size-6" />
      </Button>

      {/* Fullscreen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 border-none bg-black/95"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Images de l'œuvre</DialogTitle>

          {/* Close Button */}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
            >
              <X className="size-6" />
              <span className="sr-only">Fermer</span>
            </Button>
          </DialogClose>

          {/* Carousel */}
          <div className="flex items-center justify-center w-full h-full p-8">
            <Carousel
              className="w-full max-w-5xl h-full"
              opts={{
                align: 'center',
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {images.map((artworkImage, index) => (
                  <CarouselItem
                    key={artworkImage.id}
                    className="flex items-center justify-center h-full"
                  >
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.5}
                      maxScale={5}
                      centerOnInit
                      wheel={{ step: 0.1 }}
                      doubleClick={{ mode: 'reset' }}
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {/* Zoom Controls - Fixed at top of image area */}
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 shadow-lg">
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                zoomOut();
                              }}
                              className="size-9 text-white hover:bg-white/20 rounded-full"
                              aria-label="Dézoomer"
                            >
                              <Minus className="size-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                resetTransform();
                              }}
                              className="size-9 text-white hover:bg-white/20 rounded-full"
                              aria-label="Réinitialiser le zoom"
                            >
                              <RotateCcw className="size-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                zoomIn();
                              }}
                              className="size-9 text-white hover:bg-white/20 rounded-full"
                              aria-label="Zoomer"
                            >
                              <Plus className="size-5" />
                            </Button>
                          </div>

                          <TransformComponent
                            wrapperStyle={{
                              width: '100%',
                              height: 'calc(80vh - 60px)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            contentStyle={{
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <div className="relative w-full h-full">
                              <Image
                                src={artworkImage.image.url}
                                alt={artworkImage.image.alt || artwork.title}
                                fill
                                className="object-contain"
                                sizes="95vw"
                                priority={index === 0}
                                draggable={false}
                              />
                            </div>
                          </TransformComponent>
                        </div>
                      )}
                    </TransformWrapper>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 border-none text-white" />
                  <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 border-none text-white" />
                </>
              )}
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
