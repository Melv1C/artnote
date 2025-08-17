'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArtworkStatusSchema } from '@/schemas';
import { Artist } from '@/schemas/artist';
import { Artwork, ArtworkFormSchema, type ArtworkForm } from '@/schemas/artwork';
import { Place } from '@/schemas/place';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreateArtworkResponse, UpdateArtworkResponse } from '../../actions';
import { ArtistSelector } from './artist-selector';
import { ImageUpload } from './image-upload';
import { PlaceSelector } from './place-selector';

interface ArtworkFormProps {
  initialValues?: Artwork;
  onSubmit: (data: ArtworkForm) => Promise<CreateArtworkResponse | UpdateArtworkResponse>;
  onCancel?: () => void;
  submitLabel?: string;
  successMessage?: string;
}

export function ArtworkForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Enregistrer',
  successMessage = 'Notice enregistrée avec succès !',
}: ArtworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(
    initialValues?.artists.map(a => a.artist) || [],
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(initialValues?.place || null);

  const form = useForm<ArtworkForm>({
    resolver: zodResolver(ArtworkFormSchema),
    defaultValues: {
      title: '',
      creationYear: null,
      medium: null,
      dimensions: null,
      notice: null,
      sources: null,
      status: ArtworkStatusSchema.Values.DRAFT,
      images: [],
      placeId: null,
      artistIds: initialValues?.artists?.map(a => a.artist.id) || [],
      ...initialValues,
    },
  });

  const handleSubmit = async (data: ArtworkForm) => {
    try {
      setIsSubmitting(true);

      const result = await onSubmit(data);

      if (result.success) {
        toast.success(successMessage);
        router.push('/dashboard/artworks');
      } else {
        setIsSubmitting(false);
        toast.error(result.error || "Erreur lors de l'enregistrement de la notice");
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
      setIsSubmitting(false);
      toast.error('Une erreur inattendue est survenue. Vérifiez la console pour plus de détails.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre *</FormLabel>
                <FormControl>
                  <Input placeholder="Titre de l'œuvre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Creation Year */}
          <FormField
            control={form.control}
            name="creationYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année de création</FormLabel>
                <FormControl>
                  <Input
                    placeholder="2023, XIXe siècle..."
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Brouillon</SelectItem>
                    <SelectItem value="PUBLISHED">Publié</SelectItem>
                    <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Medium */}
          <FormField
            control={form.control}
            name="medium"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technique</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Huile sur toile, Bronze..."
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dimensions */}
          <FormField
            control={form.control}
            name="dimensions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dimensions</FormLabel>
                <FormControl>
                  <Input
                    placeholder="100 x 80 cm"
                    {...field}
                    value={field.value || ''}
                    onChange={e => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Place Selector */}
          <FormField
            control={form.control}
            name="placeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lieu de conservation</FormLabel>
                <FormControl>
                  <PlaceSelector
                    selectedPlace={selectedPlace}
                    onSelectionChange={place => {
                      setSelectedPlace(place);
                      field.onChange(place?.id || null);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Artists Selector */}
          <FormField
            control={form.control}
            name="artistIds"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Artistes</FormLabel>
                <FormControl>
                  <ArtistSelector
                    selectedArtists={selectedArtists}
                    onSelectionChange={artists => {
                      setSelectedArtists(artists);
                      field.onChange(artists.map(a => a.id));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notice */}
        <FormField
          control={form.control}
          name="notice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notice</FormLabel>
              <FormControl>
                <RichTextEditor value={field.value || ''} onChange={val => field.onChange(val)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sources */}
        <FormField
          control={form.control}
          name="sources"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sources</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value || ''}
                  onChange={val => field.onChange(val)}
                  placeholder="Ajoutez des liens ou des références"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Images */}
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Images</FormLabel>
              <FormControl>
                <ImageUpload images={field.value} onChange={field.onChange} maxImages={10} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onCancel?.() || router.push('/dashboard/artworks')}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
