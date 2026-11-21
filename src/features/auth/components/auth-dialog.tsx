import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { SignInForm } from './sign-in-form';
import { SignUpForm } from './sign-up-form';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleClose = () => {
    onOpenChange(false);
    // Back to sign-in once the closing animation is over
    setTimeout(() => setMode('signin'), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent sheetOnMobile className="gap-6 sm:max-w-[420px]">
        <DialogHeader className="items-center text-center sm:items-center sm:text-center">
          <img
            src="/logo-96.png"
            alt=""
            width={48}
            height={48}
            className="mb-2 size-12 rounded-xl bg-white ring-1 ring-border"
          />
          <DialogTitle>{mode === 'signin' ? 'Se connecter' : 'Créer un compte'}</DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Retrouvez votre compte ArtNote.'
              : 'Un compte gratuit, pour suivre les notices qui vous intéressent.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'signin' ? (
          <SignInForm onSuccess={handleClose} />
        ) : (
          <SignUpForm onSuccess={handleClose} />
        )}

        <p className="text-center text-sm text-muted-foreground">
          {mode === 'signin' ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <Button
            variant="link"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="h-auto p-0 text-sm font-semibold"
          >
            {mode === 'signin' ? 'Créer un compte' : 'Se connecter'}
          </Button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
