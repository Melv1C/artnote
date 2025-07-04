import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Artwork, ArtworkStatusSchema } from '@/schemas';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  Edit,
  ExternalLink,
  EyeIcon,
  ImageIcon,
  MoreHorizontal,
  Palette,
  Ruler,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ArtworkCardProps {
  artwork: Artwork;
  onDelete?: (artworkId: string) => Promise<void>;
  onStatusChange?: (artworkId: string, status: string) => Promise<void>;
  isPending?: boolean;
}

// Status configuration with better styling
const statusConfig = {
  DRAFT: {
    label: 'Brouillon',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  PUBLISHED: {
    label: 'Publié',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  ARCHIVED: {
    label: 'Archivé',
    className:
      'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/10 dark:text-gray-400 dark:border-gray-800',
    dotColor: 'bg-gray-500',
  },
} as const;

export function ArtworkCard({
  artwork,
  onDelete,
  onStatusChange,
  isPending,
}: ArtworkCardProps) {
  const {
    id,
    title,
    creationYear,
    medium,
    dimensions,
    status,
    viewCount,
    updatedAt,
    images,
    // Add other fields when available in the schema
  } = artwork;

  const statusInfo = statusConfig[status];

  // Get main image
  const mainImage = images?.find((img) => img.isMain) || images?.[0];

  const handleDelete = async () => {
    if (onDelete && !isPending) {
      await onDelete(id);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (onStatusChange && !isPending) {
      await onStatusChange(id, newStatus);
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-border/50 hover:border-border flex flex-col h-full">
      {/* Image Section */}
      <div className="relative h-48 bg-muted/50 overflow-hidden">
        {mainImage?.image ? (
          <Image
            src={mainImage.image.url}
            alt={mainImage.image.alt || title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}

        {/* Status Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className={`text-xs font-medium border ${statusInfo.className}`}
          >
            <div
              className={`w-2 h-2 rounded-full mr-1.5 ${statusInfo.dotColor}`}
            />
            {statusInfo.label}
          </Badge>
        </div>

        {/* View Count - Top Right */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="secondary"
            className="text-xs bg-black/50 text-white border-transparent"
          >
            <EyeIcon className="h-3 w-3 mr-1" />
            {viewCount || 0}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3 flex-1">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Artwork Details Grid */}
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            {creationYear && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{creationYear}</span>
              </div>
            )}

            {medium && (
              <div className="flex items-center gap-2">
                <Palette className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{medium}</span>
              </div>
            )}

            {dimensions && (
              <div className="flex items-center gap-2">
                <Ruler className="h-3.5 w-3.5 shrink-0" />
                <span>{dimensions}</span>
              </div>
            )}

            {/* TODO: Add place, artists when available in schema */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 mt-auto">
        {/* Updated timestamp */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              {formatDistanceToNow(new Date(updatedAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Main Edit Button */}
          <Button
            size="sm"
            variant="default"
            asChild
            className="flex-1"
            disabled={isPending}
          >
            <Link href={`/dashboard/artworks/${id}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Modifier
            </Link>
          </Button>

          {/* Preview Button */}
          <Button size="sm" variant="outline" asChild disabled={isPending}>
            <Link href={`/artworks/${id}/preview`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">Aperçu</span>
            </Link>
          </Button>

          {/* Status Change + More Actions */}
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
            <DropdownMenuContent align="end" className="w-48">
              {/* Status Change Options */}
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Changer le statut
              </div>
              {ArtworkStatusSchema.options
                .filter((s) => s !== status)
                .map((newStatus) => (
                  <DropdownMenuItem
                    key={newStatus}
                    className="flex items-center gap-2"
                    onClick={() => handleStatusChange(newStatus)}
                    disabled={isPending}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${statusConfig[newStatus].dotColor}`}
                    />
                    {statusConfig[newStatus].label}
                  </DropdownMenuItem>
                ))}

              <DropdownMenuSeparator />

              {/* Delete Action */}
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
