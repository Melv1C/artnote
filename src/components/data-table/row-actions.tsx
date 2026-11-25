import { useConfirm } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { runMutation } from '@/lib/run-mutation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cloneElement, type ReactElement, type ReactNode } from 'react';

/** A dashboard row's menu of actions, behind a "…" button. */
export function RowMenu({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 md:size-8" disabled={disabled}>
          <MoreHorizontal />
          <span className="sr-only">Plus d’actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A menu item that opens the row's edit page, given as a `<Link>` with no text. */
export function EditMenuItem({ link, className }: { link: ReactElement; className?: string }) {
  return (
    <DropdownMenuItem asChild className={className}>
      {cloneElement(
        link,
        {},
        <>
          <Pencil />
          Modifier
        </>,
      )}
    </DropdownMenuItem>
  );
}

interface DeleteMenuItemProps {
  /** The confirmation's question, such as "Supprimer Giotto ?" */
  title: string;
  /** What deleting it does to the rest of the content */
  consequence: string;
  confirmLabel?: string;
  /** Deletes the row and refreshes what shows it */
  onDelete: () => Promise<unknown>;
  messages: { deleted: string; failed: string };
}

/** A menu item that deletes the row once the writer confirms it. */
export function DeleteMenuItem({
  title,
  consequence,
  confirmLabel = 'Supprimer',
  onDelete,
  messages,
}: DeleteMenuItemProps) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title,
      description: `${consequence} Cette action est définitive.`,
      confirmLabel,
      destructive: true,
    });
    if (confirmed) {
      await runMutation(onDelete, { success: messages.deleted, failure: messages.failed });
    }
  };

  return (
    <DropdownMenuItem variant="destructive" onClick={handleDelete}>
      <Trash2 />
      Supprimer
    </DropdownMenuItem>
  );
}
