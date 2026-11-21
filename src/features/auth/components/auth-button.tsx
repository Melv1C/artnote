import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UserButton } from './user-button';

interface AuthButtonProps {
  onSignInClick: () => void;
}

export function AuthButton({ onSignInClick }: AuthButtonProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // As wide as "Se connecter", what most readers get, so the header does not shift
    return (
      <Skeleton
        className="h-10 w-[7.25rem] rounded-full md:h-9"
        aria-label="Chargement du compte"
      />
    );
  }

  if (user) {
    return <UserButton user={user} />;
  }

  return (
    <Button onClick={onSignInClick} variant="outline" className="rounded-full">
      Se connecter
    </Button>
  );
}
