import { Button } from '@/components/ui/button';
import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { RotateCw } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Default error page for every route. Shows a French message, never the error itself, which can
 * carry internals; the details go to the console.
 */
export function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="page-width flex min-h-[60svh] items-center justify-center py-16">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          La page n’a pas pu être chargée
        </h1>
        <p className="mt-3 text-muted-foreground">
          Vérifiez votre connexion, puis réessayez. Si le problème persiste, revenez dans quelques
          minutes.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => router.invalidate()} className="rounded-full">
            <RotateCw />
            Réessayer
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Retour à l’accueil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
