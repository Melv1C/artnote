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
      <div className="page-width flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
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
      <div className="page-width pb-8 text-xs text-muted-foreground">© {currentYear} ArtNote</div>
    </footer>
  );
}
