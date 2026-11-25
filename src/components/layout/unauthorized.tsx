import { FullPageMessage } from '@/components/full-page-message';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/features/auth/components/auth-dialog';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Lock } from 'lucide-react';
import { UNAUTHORIZED_ERROR } from '@/lib/auth-functions';
import { type ErrorComponentProps, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { HomeButton } from './not-found';
import { RouteError } from './route-error';

function Unauthorized() {
  const { user } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  return (
    <>
      <FullPageMessage
        illustration={
          <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <Lock className="size-6" aria-hidden="true" />
          </div>
        }
        title="Accès non autorisé"
        actions={
          <>
            {!user && <Button onClick={() => setSigningIn(true)}>Se connecter</Button>}
            <HomeButton primary={!!user} />
          </>
        }
      >
        Cette page est réservée aux personnes qui rédigent les notices.{' '}
        {user
          ? 'Votre compte n’y a pas accès.'
          : 'Connectez-vous avec un compte administrateur pour y accéder.'}
      </FullPageMessage>
      <AuthDialog
        open={signingIn}
        onOpenChange={open => {
          setSigningIn(open);
          // Signed in or not, try the page again with the current session
          if (!open) void router.invalidate();
        }}
      />
    </>
  );
}

export function UnauthorizedOrError({ error, reset }: ErrorComponentProps) {
  return error instanceof Error && error.message === UNAUTHORIZED_ERROR ? (
    <Unauthorized />
  ) : (
    <RouteError error={error} reset={reset} />
  );
}
