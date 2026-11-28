import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextLineEditor } from '@/components/ui/rich-text-line-editor';
import { plural } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  IMAGE_FORMAT_NAMES,
  IMAGE_FORMATS,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MEGABYTES,
  MAX_IMAGES_PER_NOTICE,
} from '@/schemas/image';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, Star, StarOff, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { uploadArtworkImage } from '../../actions/artwork-mutations';
import {
  attachImages,
  detachImage,
  editAttachment,
  moveAttachment,
  setMainImage,
  type EditorAttachment,
} from '../../lib/image-attachments';

const ACCEPTED_FORMATS = Object.fromEntries(
  Object.entries(IMAGE_FORMATS).map(([type, format]) => [type, format.extensions]),
);

interface ImageUploadProps {
  images: EditorAttachment[];
  onChange: (images: EditorAttachment[]) => void;
}

/** A notice's image attachments: upload, order, main image, legend and source of each. */
export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Each file uploads on its own: the images that made it are attached even when another fails
  const handleFileUpload = async (files: File[]) => {
    if (images.length + files.length > MAX_IMAGES_PER_NOTICE) {
      toast.error(`Maximum ${MAX_IMAGES_PER_NOTICE} images autorisées`);
      return;
    }

    setIsUploading(true);
    const results = await Promise.allSettled(
      files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadArtworkImage({ data: formData });
      }),
    );
    setIsUploading(false);

    const uploaded = results.flatMap(result =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
    const failed = results.flatMap(result => (result.status === 'rejected' ? [result.reason] : []));
    if (uploaded.length > 0) {
      onChange(attachImages(images, uploaded));
      toast.success(plural(uploaded.length, 'image téléchargée', 'images téléchargées'));
    }
    if (failed.length > 0) {
      console.error('Image upload failed:', failed);
      toast.error(`Erreur lors du téléchargement de ${plural(failed.length, 'image')}`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_IMAGE_BYTES,
    disabled: isUploading,
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    onChange(moveAttachment(images, result.source.index, result.destination.index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          isUploading ? 'cursor-not-allowed opacity-50' : 'hover:border-primary hover:bg-primary/5',
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragActive ? 'Déposez les images ici' : 'Glissez-déposez vos images ici'}
          </p>
          <p className="text-xs text-muted-foreground">
            ou <span className="text-primary">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {IMAGE_FORMAT_NAMES} jusqu’à {MAX_IMAGE_MEGABYTES} Mo ({images.length}/
            {MAX_IMAGES_PER_NOTICE})
          </p>
        </div>
      </div>

      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {images.map((attachment, index) => (
                  <Draggable
                    key={attachment.imageId}
                    draggableId={attachment.imageId}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          snapshot.isDragging && 'shadow-lg',
                          attachment.isMain && 'ring-2 ring-primary',
                        )}
                      >
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                              <img
                                src={attachment.image.url}
                                alt={attachment.image.alt || 'Image'}
                                className="absolute inset-0 h-full w-full object-cover"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>

                            <div className="flex-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onChange(setMainImage(images, attachment.imageId))}
                                className="h-8 px-2"
                              >
                                {attachment.isMain ? (
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                                <span className="ml-1 text-xs">
                                  {attachment.isMain ? 'Principale' : 'Définir comme principale'}
                                </span>
                              </Button>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onChange(detachImage(images, attachment.imageId))}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              aria-label={`Retirer l’image ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Legend and source, at full width: a legend is often long */}
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium" aria-hidden>
                              Légende
                            </p>
                            <RichTextLineEditor
                              label={`Légende de l’image ${index + 1}`}
                              value={attachment.legend}
                              onChange={value =>
                                onChange(
                                  editAttachment(images, attachment.imageId, 'legend', value),
                                )
                              }
                              placeholder="Ajouter une légende (optionnel)"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium" aria-hidden>
                              Source
                            </p>
                            <RichTextLineEditor
                              label={`Source de l’image ${index + 1}`}
                              value={attachment.source}
                              onChange={value =>
                                onChange(
                                  editAttachment(images, attachment.imageId, 'source', value),
                                )
                              }
                              placeholder="Ajouter une source (optionnel)"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Sélectionnez des mots pour les mettre en italique ou en gras, ou pour en
                            faire un lien.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
