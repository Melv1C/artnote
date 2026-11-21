import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createContext, use, useCallback, useRef, useState } from 'react';

interface ConfirmOptions {
  title: string;
  description?: string;
  /** The button that goes ahead, named after the action: "Supprimer", not "OK" */
  confirmLabel: string;
  /** For an action that cannot be undone */
  destructive?: boolean;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * In-page confirmation, in place of the browser's `confirm()`: styled, French, keyboard and screen
 * reader friendly. `useConfirm()` returns a function that resolves to the choice.
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [open, setOpen] = useState(false);
  const resolver = useRef<(value: boolean) => void>(null);

  const confirm = useCallback<Confirm>(next => {
    resolver.current?.(false);
    setOptions(next);
    setOpen(true);
    return new Promise(resolve => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Dialog open={open} onOpenChange={next => !next && settle(false)}>
        <DialogContent sheetOnMobile showCloseButton={false} className="sm:max-w-md">
          {options && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{options.title}</DialogTitle>
                {options.description && (
                  <DialogDescription>{options.description}</DialogDescription>
                )}
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => settle(false)}>
                  Annuler
                </Button>
                <Button
                  variant={options.destructive ? 'destructive' : 'default'}
                  onClick={() => settle(true)}
                  autoFocus
                >
                  {options.confirmLabel}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext>
  );
}

export function useConfirm(): Confirm {
  const confirm = use(ConfirmContext);
  if (!confirm) throw new Error('useConfirm must be used within a ConfirmProvider');
  return confirm;
}
