'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, MoreHorizontal } from 'lucide-react';

interface UserActionsProps {
  selectedCount: number;
  onExportAllUsers?: () => void;
  onExportSelectedUsers?: () => void;
  onBulkEmail?: () => void;
  isLoading?: boolean;
}

export function UserActions({
  selectedCount,
  onExportAllUsers,
  onExportSelectedUsers,
  isLoading = false,
}: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                Actions groupées
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>{' '}
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onExportSelectedUsers}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Exporter la sélection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive gap-2">
                Supprimer la sélection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}{' '}
      {isLoading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <Button variant="outline" onClick={onExportAllUsers} className="gap-2">
          <Download className="h-4 w-4" />
          Exporter tout
        </Button>
      )}
    </div>
  );
}
