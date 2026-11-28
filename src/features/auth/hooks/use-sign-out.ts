import { signOut } from '@/lib/auth-client';
import { runMutation } from '@/lib/run-mutation';
import { useRouter } from '@tanstack/react-router';

/**
 * Signs out and goes to the home page, from wherever the reader or writer was: the page they leave
 * may need an account.
 */
export function useSignOut() {
  const router = useRouter();
  return () =>
    runMutation(
      async () => {
        await signOut();
        await router.navigate({ to: '/' });
      },
      { success: 'Vous êtes déconnecté', failure: 'La déconnexion a échoué. Réessayez.' },
    );
}
