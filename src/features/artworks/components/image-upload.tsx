'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArtworkImageSimplified } from '@/schemas/artwork-image';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { GripVertical, Star, StarOff, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

interface ImageUploadProps {
  images: ArtworkImageSimplified[];
  onChange: (images: ArtworkImageSimplified[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/artworks/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors du téléchargement');
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erreur lors du téléchargement');
        }

        return result;
      });

      const results = await Promise.all(uploadPromises);

      // Create new ArtworkImageSimplified objects
      const newImages: ArtworkImageSimplified[] = results.map(
        (result, index) => ({
          imageId: result.imageId!,
          sortOrder: images.length + index,
          isMain: images.length === 0 && index === 0, // First image is main by default
          source: null,
          image: result.imageData!,
        })
      );

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

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleFileUpload(acceptedFiles);
    },
    [images.length, maxImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB (matching API route limit)
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
      isMain:
        i === 0 && updatedImages.length > 0
          ? true
          : i === 0
          ? false
          : img.isMain,
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
      i === index ? { ...img, source: source || null } : img
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
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25'
          }
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
            {isDragActive
              ? 'Déposez les images ici'
              : 'Glissez-déposez vos images ici'}
          </p>
          <p className="text-xs text-muted-foreground">
            ou <span className="text-primary">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, WEBP jusqu'à 10MB ({images.length}/{maxImages})
          </p>
        </div>
      </div>

      {/* Images List */}
      {images.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {images.map((imageData, index) => (
                  <Draggable
                    key={index}
                    draggableId={`image-${index}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          ${snapshot.isDragging ? 'shadow-lg' : ''}
                          ${imageData.isMain ? 'ring-2 ring-primary' : ''}
                        `}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            {/* Drag Handle */}
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            {/* Image Preview */}
                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                              <Image
                                src={imageData.image.url}
                                alt={imageData.image.alt || 'Image'}
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Image Info */}
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
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
                                    {imageData.isMain
                                      ? 'Principale'
                                      : 'Définir comme principale'}
                                  </span>
                                </Button>
                              </div>

                              <div className="flex items-center gap-2">
                                <Label
                                  htmlFor={`source-${index}`}
                                  className="text-xs"
                                >
                                  Source:
                                </Label>
                                <Input
                                  id={`source-${index}`}
                                  placeholder="Crédit / source de l'image"
                                  value={imageData.source || ''}
                                  onChange={(e) =>
                                    updateSource(index, e.target.value)
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeImage(index)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
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
