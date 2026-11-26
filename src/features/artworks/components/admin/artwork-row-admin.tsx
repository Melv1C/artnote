import { DeleteMenuItem, EditMenuItem, RowMenu } from '@/components/data-table/row-actions';
import { Painting } from '@/components/painting';
import { Button } from '@/components/ui/button';
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { formatAgo, formatCount, formatLongDate } from '@/lib/format';
import { runMutation } from '@/lib/run-mutation';
import { cn } from '@/lib/utils';
import type { Artwork } from '@/schemas/artwork';
import { ArtworkStatusSchema, type ArtworkStatus } from '@/schemas/common';
import { Link, useRouter } from '@tanstack/react-router';
import { Eye, Pencil } from 'lucide-react';
import { useTransition } from 'react';
import { changeArtworkStatus, deleteArtwork } from '../../actions/artwork-mutations';
import { cartelLine, mainImage } from '../../lib/artwork-display';
import { ARTWORK_STATUS } from '../../lib/artwork-status';
import { StatusBadge, StatusDot } from './status-badge';

/**
 * The list's columns once it is 42rem wide, shared by its header and its rows. Container queries
 * on the list (`@container` in ArtworkListAdmin), since the sidebar takes part of the screen.
 */
const COLUMNS =
  '@2xl:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_4.5rem] @3xl:grid-cols-[3.5rem_minmax(0,1fr)_7rem_9rem_4rem_10.5rem]';

/** The column headers of the writer's notices list; a narrow list shows none. */
export function ArtworkTableHeader() {
  return (
    <div
      role="row"
      className={cn(
        'hidden gap-x-4 border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground @2xl:grid',
        COLUMNS,
      )}
    >
      <span role="columnheader">
        <span className="sr-only">Image</span>
      </span>
      <span role="columnheader">Notice</span>
      <span role="columnheader">Statut</span>
      <span role="columnheader">Modifiée</span>
      <span role="columnheader" className="text-right">
        Vues
      </span>
      <span role="columnheader">
        <span className="sr-only">Actions</span>
      </span>
    </div>
  );
}

/** One of the writer's notices in the dashboard list, with its actions. */
export function ArtworkRowAdmin({ artwork }: { artwork: Artwork }) {
  const { id, title, status, viewCount, updatedAt, images } = artwork;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (next: ArtworkStatus) => {
    startTransition(async () => {
      await runMutation(
        async () => {
          await changeArtworkStatus({ data: { artworkId: id, status: next } });
          await router.invalidate();
        },
        { success: ARTWORK_STATUS[next].done, failure: 'Le statut n’a pas pu être changé' },
      );
    });
  };

  return (
    <div
      role="row"
      className={cn(
        'group grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3 transition-colors hover:bg-muted/50',
        COLUMNS,
        isPending && 'pointer-events-none opacity-60',
      )}
      aria-busy={isPending}
    >
      <div role="cell">
        <Painting
          image={mainImage(images)?.image}
          title={title}
          className="size-14 rounded-lg p-1.5"
          thumbnail
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
          {cartelLine(artwork, ['artist', 'year']) || 'Sans artiste ni date'}
        </p>
        {/* A narrow list has no status column */}
        <StatusBadge status={status} className="mt-1 @2xl:hidden" />
      </div>

      <div role="cell" className="hidden @2xl:block">
        <StatusBadge status={status} />
      </div>

      <div role="cell" className="hidden text-sm text-muted-foreground @2xl:block">
        <time dateTime={updatedAt.toISOString()} title={formatLongDate(updatedAt)}>
          {formatAgo(updatedAt)}
        </time>
      </div>

      <div
        role="cell"
        className="hidden text-right text-sm tabular-nums text-muted-foreground @2xl:block"
      >
        {formatCount(viewCount)}
        <span className="sr-only"> vues</span>
      </div>

      <div role="cell" className="flex items-center justify-end gap-1">
        <Button asChild size="sm" variant="ghost" className="hidden @3xl:inline-flex">
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
        <RowMenu disabled={isPending}>
          <EditMenuItem
            className="@3xl:hidden"
            link={<Link to="/dashboard/artworks/$artworkId/edit" params={{ artworkId: id }} />}
          />
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Statut
          </DropdownMenuLabel>
          {ArtworkStatusSchema.options
            .filter(s => s !== status)
            .map(next => (
              <DropdownMenuItem key={next} onClick={() => handleStatusChange(next)}>
                <StatusDot status={next} className="mx-1 size-2" />
                {ARTWORK_STATUS[next].action}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DeleteMenuItem
            title={`Supprimer « ${title} » ?`}
            consequence="La notice, ses images et ses vues seront supprimées."
            confirmLabel="Supprimer la notice"
            onDelete={async () => {
              await deleteArtwork({ data: id });
              await router.invalidate();
            }}
            messages={{
              deleted: 'Notice supprimée',
              failed: 'La notice n’a pas pu être supprimée.',
            }}
          />
        </RowMenu>
      </div>
    </div>
  );
}
