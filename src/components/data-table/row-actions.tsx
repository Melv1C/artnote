import { useConfirm } from '@/components/confirm-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { runMutation } from '@/lib/run-mutation';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { cloneElement, type ReactElement } from 'react';

interface RowActionsProps {
  /** A `<Link>` to the row's edit page; its text is set here */
  editLink: ReactElement;
  /** What to delete, as the confirmation names it: "Supprimer <name> ?" */
  name: string;
  /** What deleting it does to the rest of the content */
  deleteConsequence: string;
  /** Deletes the row and refreshes the table */
  onDelete: () => Promise<unknown>;
  messages: { deleted: string; failed: string };
}

/** A dashboard row's menu: edit it, or delete it once confirmed. */
export function RowActions({
  editLink,
  name,
  deleteConsequence,
  onDelete,
  messages,
}: RowActionsProps) {
  const confirm = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Supprimer ${name} ?`,
      description: `${deleteConsequence} Cette action est définitive.`,
      confirmLabel: 'Supprimer',
      destructive: true,
    });
    if (confirmed)
      await runMutation(onDelete, { success: messages.deleted, failure: messages.failed });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          {cloneElement(
            editLink,
            {},
            <>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </>,
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
