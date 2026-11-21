import { Button } from '@/components/ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { ArtworkImage } from '@/schemas/artwork-image';
import { Minus, Plus, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  type ReactZoomPanPinchContentRef,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch';

interface ArtworkImageViewerProps {
  title: string;
  images: ArtworkImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The image shown first */
  startIndex: number;
}

/**
 * Full-screen viewer: the paintings on black, pinch or double-tap to zoom, swipe between images.
 */
export function ArtworkImageViewer({
  title,
  images,
  open,
  onOpenChange,
  startIndex,
}: ArtworkImageViewerProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [index, setIndex] = useState(startIndex);
  // Zoomed in, a drag pans the image; at rest, it swipes to the next one
  const [zoomed, setZoomed] = useState(false);
  // Each slide keeps its own zoom: reset the ones left behind
  const zoomers = useRef<(ReactZoomPanPinchContentRef | null)[]>([]);

  // Each opening starts on the image that was tapped
  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    api?.reInit({ watchDrag: !zoomed });
  }, [api, zoomed]);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const selected = api.selectedScrollSnap();
      setIndex(selected);
      setZoomed(false);
      zoomers.current.forEach((zoomer, i) => {
        if (i !== selected) void zoomer?.resetTransform(0);
      });
    };
    api.on('select', onSelect);
    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="inset-0 top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-none bg-black p-0 text-white sm:max-w-none"
        showCloseButton={false}
        aria-describedby={undefined}
        onKeyDown={event => {
          if (zoomed) return;
          if (event.key === 'ArrowLeft') api?.scrollPrev();
          if (event.key === 'ArrowRight') api?.scrollNext();
        }}
      >
        <DialogTitle className="sr-only">Images de {title}</DialogTitle>

        <div className="pt-safe absolute inset-x-0 top-0 z-50 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex h-14 items-center justify-between px-3">
            <p className="work-title truncate pl-1 text-base text-white/90">{title}</p>
            <div className="flex items-center gap-3">
              {images.length > 1 && (
                <span className="text-sm text-white/70 tabular-nums">
                  {index + 1} / {images.length}
                </span>
              )}
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/15 hover:text-white"
                >
                  <X className="size-6" />
                  <span className="sr-only">Fermer</span>
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>

        <Carousel
          setApi={setApi}
          className="h-full w-full"
          opts={{ align: 'center', loop: images.length > 1, startIndex }}
        >
          <CarouselContent className="ml-0 h-dvh">
            {images.map((attachment, i) => (
              <CarouselItem key={attachment.imageId} className="h-full pl-0">
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={6}
                  centerOnInit
                  wheel={{ step: 0.15 }}
                  doubleClick={{ mode: 'toggle', step: 1.5 }}
                  ref={zoomer => {
                    zoomers.current[i] = zoomer;
                  }}
                  panning={{ disabled: !zoomed }}
                  onTransform={(_, state) => {
                    // Only the image in view decides whether a drag pans or swipes
                    if (i === index) setZoomed(state.scale > 1.01);
                  }}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <div className="relative flex h-full w-full flex-col">
                      <TransformComponent
                        wrapperStyle={{ width: '100%', height: '100%', touchAction: 'none' }}
                        contentStyle={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={attachment.image.url}
                          alt={attachment.image.alt || title}
                          className="max-h-[calc(100dvh-8rem)] max-w-full object-contain"
                          loading={i === startIndex ? 'eager' : 'lazy'}
                          draggable={false}
                          decoding="async"
                        />
                      </TransformComponent>

                      <div className="pb-safe absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-black/70 to-transparent pt-10">
                        <div className="mb-4 flex gap-1 rounded-full bg-white/10 p-1 backdrop-blur-md">
                          <ZoomButton label="Dézoomer" onClick={() => zoomOut()}>
                            <Minus className="size-5" />
                          </ZoomButton>
                          <ZoomButton label="Ajuster à l’écran" onClick={() => resetTransform()}>
                            <RotateCcw className="size-5" />
                          </ZoomButton>
                          <ZoomButton label="Zoomer" onClick={() => zoomIn()}>
                            <Plus className="size-5" />
                          </ZoomButton>
                        </div>
                      </div>
                    </div>
                  )}
                </TransformWrapper>
              </CarouselItem>
            ))}
          </CarouselContent>

          {images.length > 1 && (
            <>
              <CarouselPrevious className="left-2 size-11 border-none bg-white/15 text-white hover:bg-white/30 hover:text-white md:left-4" />
              <CarouselNext className="right-2 size-11 border-none bg-white/15 text-white hover:bg-white/30 hover:text-white md:right-4" />
            </>
          )}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}

function ZoomButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={event => {
        event.stopPropagation();
        onClick();
      }}
      className="size-11 rounded-full text-white hover:bg-white/20 hover:text-white md:size-11"
      aria-label={label}
    >
      {children}
    </Button>
  );
}
