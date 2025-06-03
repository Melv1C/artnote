'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/features/auth/hooks';
import { UserButton } from './user-button';

interface AuthButtonProps {
  onSignInClick: () => void;
}

export function AuthButton({ onSignInClick }: AuthButtonProps) {
  const { user, isLoading } = useAuth();

  // Show skeleton while loading
  if (isLoading) {
    return <Skeleton className="h-8 w-20 rounded-md" />;
  }

  // Show user dropdown if authenticated
  if (user) {
    return <UserButton user={user} />;
  }

  // Show sign in button if not authenticated
  return <Button onClick={onSignInClick}>Se connecter</Button>;
}
