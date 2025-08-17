export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-muted-foreground">
          © {currentYear} ArtNote. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
