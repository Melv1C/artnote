import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RichTextLineEditor } from '@/components/ui/rich-text-line-editor';
import { type ArtworkImage } from '@/schemas/artwork-image';
import { uploadArtworkImage } from '../../actions/artwork-mutations';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { GripVertical, Star, StarOff, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: ArtworkImage[];
  onChange: (images: ArtworkImage[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadedImages = await Promise.all(
        files.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          return uploadArtworkImage({ data: formData });
        }),
      );

      const newImages: ArtworkImage[] = uploadedImages.map((image, index) => ({
        imageId: image.id,
        sortOrder: images.length + index,
        isMain: images.length === 0 && index === 0, // First image is main by default
        legend: null,
        source: null,
        image,
      }));

      // We have the image ID from the database after upload
      const updatedImages = [...images, ...newImages];
      onChange(updatedImages);
      toast.success(`${files.length} image(s) téléchargée(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors du téléchargement des images');
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileUpload,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.avif', '.gif'],
    },
    maxSize: 10 * 1024 * 1024, // 10 Mo (matching API route limit)
    disabled: isUploading,
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedImages = Array.from(images);
    const [movedImage] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, movedImage);

    // Update sort orders
    const updatedImages = reorderedImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    onChange(updatedImages);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    // Update sort orders and handle main image logic
    const reorderedImages = updatedImages.map((img, i) => ({
      ...img,
      sortOrder: i,
      isMain: i === 0 && updatedImages.length > 0 ? true : i === 0 ? false : img.isMain,
    }));
    onChange(reorderedImages);
  };

  const toggleMainImage = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
    }));
    onChange(updatedImages);
  };

  const updateSource = (index: number, source: string) => {
    const updatedImages = images.map((img, i) =>
      i === index ? { ...img, source: source || null } : img,
    );
    onChange(updatedImages);
  };

  const updateLegend = (index: number, legend: string) => {
    const updatedImages = images.map((img, i) =>
      i === index ? { ...img, legend: legend || null } : img,
    );
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${
            isUploading
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-primary hover:bg-primary/5'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isDragActive ? 'Déposez les images ici' : 'Glissez-déposez vos images ici'}
          </p>
          <p className="text-xs text-muted-foreground">
            ou <span className="text-primary">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP jusqu’à 10 Mo ({images.length}/{maxImages})
          </p>
        </div>
      </div>

      {/* Images List */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images">
            {provided => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                {images.map((imageData, index) => (
                  <Draggable key={index} draggableId={`image-${index}`} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          ${snapshot.isDragging ? 'shadow-lg' : ''}
                          ${imageData.isMain ? 'ring-2 ring-primary' : ''}
                        `}
                      >
                        <CardContent className="space-y-3 p-4">
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            {/* Image Preview */}
                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                              <img
                                src={imageData.image.url}
                                alt={imageData.image.alt || 'Image'}
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
                                onClick={() => toggleMainImage(index)}
                                className="h-8 px-2"
                              >
                                {imageData.isMain ? (
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                                <span className="ml-1 text-xs">
                                  {imageData.isMain ? 'Principale' : 'Définir comme principale'}
                                </span>
                              </Button>
                            </div>

                            {/* Remove Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
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
                              value={imageData.legend}
                              onChange={value => updateLegend(index, value ?? '')}
                              placeholder="Ajouter une légende (optionnel)"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs font-medium" aria-hidden>
                              Source
                            </p>
                            <RichTextLineEditor
                              label={`Source de l’image ${index + 1}`}
                              value={imageData.source}
                              onChange={value => updateSource(index, value ?? '')}
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
