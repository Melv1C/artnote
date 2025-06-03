import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    discover: [
      { name: 'Œuvres récentes', href: '/artworks' },
      { name: 'Artistes', href: '/artists' },
      { name: 'Lieux culturels', href: '/places' },
    ],
    about: [
      { name: 'À propos', href: '/about' },
      { name: 'Notre mission', href: '/mission' },
      { name: 'Équipe', href: '/team' },
    ],
    legal: [
      { name: "Conditions d'utilisation", href: '/terms' },
      { name: 'Politique de confidentialité', href: '/privacy' },
      { name: 'Mentions légales', href: '/legal' },
    ],
  };
  return (
    <footer className="border-t bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <span className="font-bold text-xl">ArtNote</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Découvrez l'art à travers des notices enrichies et explorez les
              œuvres qui façonnent notre patrimoine culturel.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="font-semibold mb-4">Découvrir</h3>
            <ul className="space-y-2">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">À propos</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} ArtNote. Tous droits réservés.
            </p>
            <p className="text-sm text-muted-foreground mt-2 sm:mt-0">
              Fait avec ❤️ pour l'art et la culture
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
