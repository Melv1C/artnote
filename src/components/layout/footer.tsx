import { Logo } from '@/components/brand/logo';
import { Link } from '@tanstack/react-router';

const FOOTER_LINKS = [
  { label: 'Toutes les notices', to: '/artworks' },
  { label: 'Nouveautés', to: '/whats-new' },
  { label: 'À propos', to: '/about' },
  { label: 'Confidentialité', to: '/confidentialite' },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
        <div className="max-w-xs space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Des notices scientifiques sur la peinture, pour visiter les musées belges autrement.
          </p>
        </div>
        <nav aria-label="Pied de page">
          <ul className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:flex sm:gap-6">
            {FOOTER_LINKS.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-block py-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 pb-8 text-xs text-muted-foreground sm:px-6 lg:px-8">
        © {currentYear} ArtNote
      </div>
    </footer>
  );
}
