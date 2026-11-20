import { Button } from '@/components/ui/button';
import { Link, useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { Home, RotateCw } from 'lucide-react';
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
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Une erreur est survenue</h1>
        <p className="text-muted-foreground mb-6">
          La page n'a pas pu être chargée. Réessayez dans un instant.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.invalidate()}>
            <RotateCw className="mr-2 h-4 w-4" />
            Réessayer
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
