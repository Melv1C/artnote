import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Artwork } from '@/schemas';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Archive, Edit, EyeIcon, MoreHorizontal, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ArtworkCardProps {
  artwork: Artwork;
  onArchiveToggle?: (artworkId: string) => Promise<void>;
  onDelete?: (artworkId: string) => Promise<void>;
  isPending?: boolean;
}

// Simple status indicators
const statusConfig = {
  DRAFT: {
    label: 'Brouillon',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  PUBLISHED: {
    label: 'Publié',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  ARCHIVED: {
    label: 'Archivé',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  },
} as const;

export function ArtworkCard({
  artwork,
  onArchiveToggle,
  onDelete,
  isPending,
}: ArtworkCardProps) {
  const { id, title, creationYear, medium, status, viewCount, updatedAt } =
    artwork;
  const statusInfo = statusConfig[status];

  const handleArchiveToggle = async () => {
    if (onArchiveToggle && !isPending) {
      await onArchiveToggle(id);
    }
  };

  const handleDelete = async () => {
    if (onDelete && !isPending) {
      await onDelete(id);
    }
  };
  return (
    <Card className="group relative p-5 h-full flex flex-col transition-all duration-200 hover:shadow-md border-border/50 hover:border-border">
      {/* Status indicator */}
      <div className="absolute top-3 right-3">
        <Badge
          variant="secondary"
          className={`text-xs ${statusInfo.className}`}
        >
          {statusInfo.label}
        </Badge>
      </div>
      {/* Main content - clickable area */}
      <Link href={`/dashboard/artworks/${id}`} className="block flex-grow">
        <div className="pr-16 mb-4">
          <h3 className="text-lg font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Artwork details */}
          <div className="space-y-1 text-sm text-muted-foreground">
            {creationYear && <div>{creationYear}</div>}
            {medium && <div className="line-clamp-2">{medium}</div>}
          </div>
        </div>
      </Link>
      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <EyeIcon className="h-3 w-3" />
          <span>{viewCount || 0}</span>
        </div>
        <div>
          {formatDistanceToNow(new Date(updatedAt), {
            addSuffix: true,
            locale: fr,
          })}
        </div>
      </div>{' '}
      {/* Action buttons - pushed to bottom */}
      <div className="flex items-center gap-2 mt-auto">
        <Button
          size="sm"
          variant="outline"
          asChild
          className="flex-1"
          disabled={isPending}
        >
          <Link href={`/dashboard/artworks/${id}/edit`}>
            <Edit className="h-3.5 w-3.5 mr-1.5" />
            Modifier
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={isPending}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Plus d'actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleArchiveToggle}
              disabled={isPending}
            >
              <Archive className="h-4 w-4" />
              {status === 'ARCHIVED' ? 'Désarchiver' : 'Archiver'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
