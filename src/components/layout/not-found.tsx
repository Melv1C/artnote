import { FullPageMessage } from '@/components/full-page-message';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';

export function NotFound() {
  return (
    <FullPageMessage
      illustration={
        <div
          className="mx-auto mb-8 flex aspect-[4/3] w-40 items-center justify-center rounded-xl bg-wall"
          aria-hidden="true"
        >
          <div className="h-16 w-20 rounded-[3px] border-2 border-dashed border-muted-foreground/40" />
        </div>
      }
      title="Page introuvable"
      actions={
        <>
          <Button asChild>
            <Link to="/artworks">Parcourir les notices</Link>
          </Button>
          <HomeButton />
        </>
      }
    >
      Ce mur est vide : la page a été déplacée, ou l’adresse contient une faute de frappe.
    </FullPageMessage>
  );
}

/** The way out of a message page: back to the home page. */
export function HomeButton({ primary = false }: { primary?: boolean }) {
  return (
    <Button asChild variant={primary ? 'default' : 'outline'}>
      <Link to="/">Retour à l’accueil</Link>
    </Button>
  );
}
