'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, Mail, MoreHorizontal } from 'lucide-react';

interface UserActionsProps {
  selectedCount: number;
  onExportUsers?: () => void;
  onBulkEmail?: () => void;
  isLoading?: boolean;
}

export function UserActions({
  selectedCount,
  onExportUsers,
  onBulkEmail,
  isLoading = false,
}: UserActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {selectedCount > 0 && (
        <>
          <Badge variant="secondary">
            {selectedCount} utilisateur{selectedCount > 1 ? 's' : ''}{' '}
            sélectionné{selectedCount > 1 ? 's' : ''}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                Actions groupées
                <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onBulkEmail} className="gap-2">
                <Mail className="h-4 w-4" />
                Envoyer un email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportUsers} className="gap-2">
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
      )}

      {isLoading ? (
        <Skeleton className="h-9 w-24" />
      ) : (
        <Button variant="outline" onClick={onExportUsers} className="gap-2">
          <Download className="h-4 w-4" />
          Exporter tout
        </Button>
      )}
    </div>
  );
}
