import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <div className="page-width flex min-h-[60svh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <div
          className="mx-auto mb-8 flex aspect-[4/3] w-40 items-center justify-center rounded-xl bg-wall"
          aria-hidden="true"
        >
          <div className="h-16 w-20 rounded-[3px] border-2 border-dashed border-muted-foreground/40" />
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Ce mur est vide : la page a été déplacée, ou l’adresse contient une faute de frappe.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-full">
            <Link to="/artworks">Parcourir les notices</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Retour à l’accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
