import { Link } from '@tanstack/react-router';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-4">
        <p>© {currentYear} ArtNote. Tous droits réservés.</p>
        <Link to="/confidentialite" className="underline underline-offset-4 hover:text-foreground">
          Confidentialité
        </Link>
      </div>
    </footer>
  );
}
