'use client';

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
    // Reset to signin mode when dialog closes
    setTimeout(() => setMode('signin'), 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'signin' ? 'Se connecter' : 'Créer un compte'}</DialogTitle>
          <DialogDescription>
            {mode === 'signin'
              ? 'Connectez-vous à votre compte ArtNote'
              : "Créez votre compte pour commencer à explorer l'art"}
          </DialogDescription>
        </DialogHeader>

        {mode === 'signin' ? (
          <SignInForm onSuccess={handleClose} />
        ) : (
          <SignUpForm onSuccess={handleClose} />
        )}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-sm"
          >
            {mode === 'signin'
              ? 'Pas encore de compte ? Créer un compte'
              : 'Déjà un compte ? Se connecter'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
