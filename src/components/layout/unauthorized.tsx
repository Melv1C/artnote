import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { UNAUTHORIZED_ERROR } from '@/lib/auth-functions';
import { type ErrorComponentProps, Link } from '@tanstack/react-router';
import { RouteError } from './route-error';

function Unauthorized() {
  return (
    <div className="flex min-h-[70svh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Lock className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Accès non autorisé</h1>
        <p className="mt-3 text-muted-foreground">
          Cette page est réservée aux personnes qui rédigent les notices. Connectez-vous avec un
          compte administrateur pour y accéder.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link to="/">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  );
}

export function UnauthorizedOrError({ error, reset }: ErrorComponentProps) {
  return error instanceof Error && error.message === UNAUTHORIZED_ERROR ? (
    <Unauthorized />
  ) : (
    <RouteError error={error} reset={reset} />
  );
}
