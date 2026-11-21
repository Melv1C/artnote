import { useConfirm } from '@/components/confirm-dialog';
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
import { editorPresets, RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArtworkStatusSchema } from '@/schemas/common';
import type { Artist } from '@/schemas/artist';
import {
  type Artwork,
  ArtworkEditorSchema,
  type ArtworkEditorValues,
  type ArtworkForm,
} from '@/schemas/artwork';
import { type Place } from '@/schemas/place';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ARTWORK_STATUS_LABELS } from '../../lib/artwork-status';
import { ArtistSelector } from './artist-selector';
import { ImageUpload } from './image-upload';
import { PlaceSelector } from './place-selector';

interface ArtworkFormProps {
  initialValues?: Artwork;
  onSubmit: (data: ArtworkForm) => Promise<void>;
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
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>(
    initialValues?.artists.map(a => a.artist) || [],
  );
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(initialValues?.place || null);

  const form = useForm<ArtworkEditorValues>({
    resolver: zodResolver(ArtworkEditorSchema),
    defaultValues: {
      title: '',
      creationYear: null,
      medium: null,
      dimensions: null,
      notice: null,
      sources: null,
      status: ArtworkStatusSchema.enum.DRAFT,
      images: [],
      placeId: null,
      artistIds: initialValues?.artists?.map(a => a.artist.id) || [],
      ...initialValues,
    },
  });

  const handleSubmit = async (data: ArtworkEditorValues) => {
    try {
      setIsSubmitting(true);

      await onSubmit(data);
      toast.success(successMessage);
      await navigate({ to: '/dashboard/artworks' });
    } catch (error) {
      console.error('Saving artwork failed:', error);
      setIsSubmitting(false);
      toast.error('La notice n’a pas pu être enregistrée. Réessayez.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          {/* The text: what readers read */}
          <div className="space-y-6">
            <FormSection title="Notice">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Titre de l’œuvre"
                        className="h-12 font-serif text-xl italic md:h-12 md:text-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notice</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={val => field.onChange(val)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sources"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bibliographie</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        value={field.value || ''}
                        onChange={val => field.onChange(val)}
                        config={editorPresets.minimal}
                        placeholder="Ajoutez des liens ou des références"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
            <FormSection
              title="Images"
              description="L’image principale (étoile) illustre la notice dans les listes."
            >
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
            </FormSection>
          </div>

          {/* The cartel and the publication: short facts, on the side */}
          <div className="space-y-6">
            <FormSection title="Publication">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ArtworkStatusSchema.options.map(status => (
                          <SelectItem key={status} value={status}>
                            {ARTWORK_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
            <FormSection title="L’œuvre">
              <FormField
                control={form.control}
                name="artistIds"
                render={({ field }) => (
                  <FormItem>
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
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matériaux et techniques</FormLabel>
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
            </FormSection>
          </div>
        </div>

        {/* Always within reach, however long the notice */}
        <div className="sticky bottom-0 z-30 -mx-4 mt-8 border-t bg-background/90 backdrop-blur-xl lg:-mx-8">
          <div className="flex items-center justify-end gap-3 px-4 py-3 lg:px-8">
            {form.formState.isDirty && !isSubmitting && (
              <p className="mr-auto hidden text-sm text-muted-foreground sm:block">
                Modifications non enregistrées
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                // Leaving loses the changes: ask first
                if (
                  form.formState.isDirty &&
                  !(await confirm({
                    title: 'Quitter sans enregistrer ?',
                    description: 'Les modifications apportées à cette notice seront perdues.',
                    confirmLabel: 'Quitter sans enregistrer',
                    destructive: true,
                  }))
                ) {
                  return;
                }
                if (onCancel) onCancel();
                else void navigate({ to: '/dashboard/artworks' });
              }}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-xl border bg-card p-5 shadow-xs sm:p-6">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}
