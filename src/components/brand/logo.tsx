import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

/** The ArtNote wordmark, linking home. The image mark is kept for icons. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'inline-flex h-11 items-center rounded-lg font-serif text-[1.6rem] leading-none font-medium tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label="ArtNote, accueil"
    >
      ArtNote
    </Link>
  );
}
