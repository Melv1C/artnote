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
import { runMutation } from '@/lib/run-mutation';
import {
  type Artwork,
  ArtworkEditorSchema,
  type ArtworkEditorValues,
  toArtworkForm,
} from '@/schemas/artwork';
import { ArtworkStatusSchema } from '@/schemas/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBlocker, useNavigate } from '@tanstack/react-router';
import { useRef } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { createArtwork, updateArtwork } from '../../actions/artwork-mutations';
import { ARTWORK_STATUS } from '../../lib/artwork-status';
import { ArtistSelector } from './artist-selector';
import { ImageUpload } from './image-upload';
import { PlaceSelector } from './place-selector';

/** The editor's starting values: a blank draft, or the notice being edited. */
const editorValues = (artwork?: Artwork): ArtworkEditorValues => ({
  title: artwork?.title ?? '',
  creationYear: artwork?.creationYear ?? null,
  medium: artwork?.medium ?? null,
  dimensions: artwork?.dimensions ?? null,
  notice: artwork?.notice ?? null,
  sources: artwork?.sources ?? null,
  status: artwork?.status ?? ArtworkStatusSchema.enum.DRAFT,
  images: artwork?.images ?? [],
  artists: artwork?.artists.map(credit => credit.artist) ?? [],
  place: artwork?.place ?? null,
});

/** The notice editor; without `artwork`, it creates a new notice. */
export function ArtworkForm({ artwork }: { artwork?: Artwork }) {
  const navigate = useNavigate();
  const confirm = useConfirm();

  const form = useForm<ArtworkEditorValues>({
    resolver: zodResolver(ArtworkEditorSchema),
    defaultValues: editorValues(artwork),
  });
  const { isDirty, isSubmitting } = form.formState;

  // Saved: leaving is expected, the guard below lets it through
  const saved = useRef(false);

  // Leaving with unsaved changes, by any route (sidebar, breadcrumb, back, closing the tab),
  // asks first: there is no autosave
  useBlocker({
    shouldBlockFn: async () => {
      if (saved.current || !form.formState.isDirty) return false;
      const leave = await confirm({
        title: 'Quitter sans enregistrer ?',
        description: 'Les modifications apportées à cette notice seront perdues.',
        confirmLabel: 'Quitter sans enregistrer',
        destructive: true,
      });
      return !leave;
    },
    enableBeforeUnload: () => !saved.current && form.formState.isDirty,
  });

  const handleSubmit = async (values: ArtworkEditorValues) => {
    const data = toArtworkForm(values);
    saved.current = await runMutation(
      () =>
        artwork
          ? updateArtwork({ data: { artworkId: artwork.id, data } })
          : createArtwork({ data }),
      {
        success: artwork ? 'Notice mise à jour avec succès !' : 'Notice créée avec succès !',
        failure: 'La notice n’a pas pu être enregistrée. Réessayez.',
      },
    );
    if (saved.current) await navigate({ to: '/dashboard/artworks' });
  };

  return (
    <Form {...form}>
      <form onSubmit={event => void form.handleSubmit(handleSubmit)(event)}>
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
                      <RichTextEditor label="Notice" value={field.value} onChange={field.onChange} />
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
                        label="Bibliographie"
                        value={field.value}
                        onChange={field.onChange}
                        features={editorPresets.bibliography}
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
                      <ImageUpload images={field.value} onChange={field.onChange} />
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
                            {ARTWORK_STATUS[status].label}
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
                name="artists"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artistes</FormLabel>
                    <FormControl>
                      <ArtistSelector selectedArtists={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <OptionalTextField
                control={form.control}
                name="creationYear"
                label="Année de création"
                placeholder="2023, XIXe siècle…"
              />
              <OptionalTextField
                control={form.control}
                name="medium"
                label="Matériaux et techniques"
                placeholder="Huile sur toile, Bronze…"
              />
              <OptionalTextField
                control={form.control}
                name="dimensions"
                label="Dimensions"
                placeholder="100 x 80 cm"
              />
              <FormField
                control={form.control}
                name="place"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de conservation</FormLabel>
                    <FormControl>
                      <PlaceSelector selectedPlace={field.value} onChange={field.onChange} />
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
            {isDirty && !isSubmitting && (
              <p className="mr-auto hidden text-sm text-muted-foreground sm:block">
                Modifications non enregistrées
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              // With unsaved changes, the navigation guard asks first
              onClick={() => void navigate({ to: '/dashboard/artworks' })}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : artwork ? 'Mettre à jour' : 'Créer la notice'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

/** A one-line text the notice may leave out: an empty field means none. */
function OptionalTextField({
  control,
  name,
  label,
  placeholder,
}: {
  control: Control<ArtworkEditorValues>;
  name: 'creationYear' | 'medium' | 'dimensions';
  label: string;
  placeholder: string;
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              {...field}
              value={field.value ?? ''}
              onChange={event => field.onChange(event.target.value || null)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
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
