import { cn } from '@/lib/utils';
import type { ArtworkImage } from '@/schemas/artwork-image';
import { Frame } from 'lucide-react';

interface PaintingProps {
  image: ArtworkImage['image'] | undefined;
  /** The notice's title, the alt text when the image has none */
  title: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** Inside a link that already names the work: the image adds nothing for a screen reader */
  decorative?: boolean;
}

/**
 * A painting hung on the wall: shown whole (never cropped), with a soft shadow, on the `wall`
 * colour. Without an image, an empty frame stands in.
 */
export function Painting({
  image,
  title,
  className,
  imgClassName,
  priority,
  decorative,
}: PaintingProps) {
  return (
    <div
      className={cn('flex min-h-0 items-center justify-center overflow-hidden bg-wall', className)}
    >
      {image ? (
        <img
          src={image.url}
          alt={decorative ? '' : image.alt || title}
          width={image.width ?? undefined}
          height={image.height ?? undefined}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          className={cn(
            'h-auto max-h-full w-auto max-w-full object-contain shadow-[0_10px_24px_-8px_oklch(0.2_0.02_288/0.45),0_2px_6px_oklch(0.2_0.02_288/0.2)]',
            imgClassName,
          )}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Frame className="size-10" strokeWidth={1.25} aria-hidden="true" />
          <span className="text-xs" aria-hidden={decorative}>
            Image à venir
          </span>
        </div>
      )}
    </div>
  );
}
