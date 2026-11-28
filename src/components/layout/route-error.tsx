import { FullPageMessage } from '@/components/full-page-message';
import { Button } from '@/components/ui/button';
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router';
import { RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { HomeButton } from './not-found';

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
    <FullPageMessage
      title="La page n’a pas pu être chargée"
      actions={
        <>
          <Button onClick={() => router.invalidate()}>
            <RotateCw />
            Réessayer
          </Button>
          <HomeButton />
        </>
      }
    >
      Vérifiez votre connexion, puis réessayez. Si le problème persiste, revenez dans quelques
      minutes.
    </FullPageMessage>
  );
}
