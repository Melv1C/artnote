import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Lock } from 'lucide-react';
import { UNAUTHORIZED_ERROR } from '@/lib/auth-functions';
import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { RouteError } from './route-error';

function Unauthorized() {
  const { user } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  return (
    <div className="flex min-h-[70svh] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Lock className="size-6" aria-hidden="true" />
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight">Accès non autorisé</h1>
        <p className="mt-3 text-muted-foreground">
          {user
            ? 'Cette page est réservée aux personnes qui rédigent les notices. Votre compte n’y a pas accès.'
            : 'Cette page est réservée aux personnes qui rédigent les notices. Connectez-vous avec un compte administrateur pour y accéder.'}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {!user && (
            <Button className="rounded-full" onClick={() => setSigningIn(true)}>
              Se connecter
            </Button>
          )}
          <Button asChild variant={user ? 'default' : 'outline'} className="rounded-full">
            <Link to="/">Retour à l’accueil</Link>
          </Button>
        </div>
      </div>
      <AuthDialog
        open={signingIn}
        onOpenChange={open => {
          setSigningIn(open);
          // Signed in: try the page again with the new session
          if (!open) void router.invalidate();
        }}
      />
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
