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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { Artwork } from '@/schemas/artwork';
import { ArtworkStatusSchema, type ArtworkStatus } from '@/schemas/common';
import { Link } from '@tanstack/react-router';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { artistNames, mainImage } from '../../lib/artwork-display';
import { ARTWORK_STATUS_LABELS } from '../../lib/artwork-status';
import { Painting } from '../painting';
import { STATUS_DOT, StatusBadge } from './status-badge';

/** What moving a notice to a status is called, in the menu and its toast. */
const STATUS_ACTIONS: Record<ArtworkStatus, { label: string; done: string }> = {
  PUBLISHED: { label: 'Publier', done: 'Notice publiée' },
  DRAFT: { label: 'Repasser en brouillon', done: 'Notice repassée en brouillon' },
  ARCHIVED: { label: 'Archiver', done: 'Notice archivée' },
};

interface ArtworkRowAdminProps {
  artwork: Artwork;
  onDelete: (artworkId: string) => Promise<void>;
  onStatusChange: (artworkId: string, status: ArtworkStatus) => Promise<void>;
}

/** One of the writer's notices in the dashboard list, with its actions. */
export function ArtworkRowAdmin({ artwork, onDelete, onStatusChange }: ArtworkRowAdminProps) {
  const { id, title, creationYear, status, viewCount, updatedAt, images, artists } = artwork;
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirm();
  const subtitle = [artistNames(artists), creationYear].filter(Boolean).join(', ');

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: `Supprimer « ${title} » ?`,
      description:
        'La notice, ses images et ses vues seront supprimées. Cette action est définitive.',
      confirmLabel: 'Supprimer la notice',
      destructive: true,
    });
    if (!confirmed) return;
    startTransition(async () => {
      try {
        await onDelete(id);
        toast.success('Notice supprimée', { description: title });
      } catch (error) {
        console.error('Deleting artwork failed:', error);
        toast.error('La notice n’a pas pu être supprimée');
      }
    });
  };

  const handleStatusChange = (next: ArtworkStatus) => {
    startTransition(async () => {
      try {
        await onStatusChange(id, next);
        toast.success(STATUS_ACTIONS[next].done, { description: title });
      } catch (error) {
        console.error('Changing artwork status failed:', error);
        toast.error('Le statut n’a pas pu être changé');
      }
    });
  };

  return (
    <div
      role="row"
      className={cn(
        'group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 transition-colors hover:bg-muted/50 md:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_4.5rem] lg:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_10.5rem]',
        isPending && 'pointer-events-none opacity-60',
      )}
      aria-busy={isPending}
    >
      <div role="cell">
        <Painting
          image={mainImage(images)?.image}
          title={title}
          className="size-14 rounded-lg p-1.5 [&_svg]:size-5 [&_span]:hidden"
          imgClassName="shadow-sm"
          decorative
        />
      </div>

      <div role="cell" className="min-w-0">
        <Link
          to="/dashboard/artworks/$artworkId/edit"
          params={{ artworkId: id }}
          className="work-title block truncate text-lg leading-snug outline-none hover:text-primary focus-visible:underline"
        >
          {title}
        </Link>
        <p className="truncate text-sm text-muted-foreground">
          {subtitle || 'Sans artiste ni date'}
          {/* Narrow screens: the status rides along with the subtitle */}
          <span className="md:hidden">
            {' · '}
            <span
              className={cn('inline-block size-1.5 rounded-full align-middle', STATUS_DOT[status])}
              aria-hidden="true"
            />{' '}
            {ARTWORK_STATUS_LABELS[status]}
          </span>
        </p>
      </div>

      <div role="cell" className="hidden md:block">
        <StatusBadge status={status} />
      </div>

      <div role="cell" className="hidden text-sm text-muted-foreground md:block">
        <time
          dateTime={new Date(updatedAt).toISOString()}
          title={format(new Date(updatedAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
        >
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: fr })}
        </time>
      </div>

      <div
        role="cell"
        className="hidden text-right text-sm tabular-nums text-muted-foreground md:block"
      >
        {viewCount.toLocaleString('fr-BE')}
        <span className="sr-only"> vues</span>
      </div>

      <div role="cell" className="flex items-center justify-end gap-1">
        <Button asChild size="sm" variant="ghost" className="hidden lg:inline-flex">
          <Link to="/dashboard/artworks/$artworkId/edit" params={{ artworkId: id }}>
            <Pencil />
            Modifier
          </Link>
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button asChild size="icon" variant="ghost" className="size-8 md:size-8">
              <Link to="/artworks/$artworkId/preview" params={{ artworkId: id }} target="_blank">
                <Eye />
                <span className="sr-only">Aperçu (nouvel onglet)</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Aperçu</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 md:size-8" disabled={isPending}>
              <MoreHorizontal />
              <span className="sr-only">Plus d’actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild className="lg:hidden">
              <Link to="/dashboard/artworks/$artworkId/edit" params={{ artworkId: id }}>
                <Pencil />
                Modifier
              </Link>
            </DropdownMenuItem>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Statut
            </DropdownMenuLabel>
            {ArtworkStatusSchema.options
              .filter(s => s !== status)
              .map(next => (
                <DropdownMenuItem key={next} onClick={() => handleStatusChange(next)}>
                  <span
                    className={cn('mx-1 size-2 rounded-full', STATUS_DOT[next])}
                    aria-hidden="true"
                  />
                  {STATUS_ACTIONS[next].label}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleDelete}>
              <Trash2 />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
