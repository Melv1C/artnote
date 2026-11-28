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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        sheetOnMobile
        className="gap-6 sm:max-w-[420px]"
        // On a touch screen, show the whole sheet first: focusing the email field would open the
        // keyboard over the password and the button. Focus goes to the sheet itself, so a screen
        // reader is inside it
        onOpenAutoFocus={event => {
          if (!window.matchMedia('(pointer: coarse)').matches) return;
          event.preventDefault();
          (event.currentTarget as HTMLElement).focus();
        }}
      >
        <AuthDialogBody onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

/**
 * Sign-in or sign-up. Mounted with the dialog's content, which unmounts once its closing animation
 * is over: each opening starts at sign-in.
 */
function AuthDialogBody({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <>
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
            : 'Un compte gratuit, en quelques secondes.'}
        </DialogDescription>
      </DialogHeader>

      {mode === 'signin' ? (
        <SignInForm onSuccess={onSuccess} />
      ) : (
        <SignUpForm onSuccess={onSuccess} />
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
    </>
  );
}
