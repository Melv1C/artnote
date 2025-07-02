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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { ArtworkStatusSchema } from '@/schemas';
import { ArtworkFormSchema, type ArtworkForm } from '@/schemas/artwork';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreateArtworkResponse, UpdateArtworkResponse } from '../actions';
import { ImageUpload } from './image-upload';

interface ArtworkFormProps {
  initialValues?: ArtworkForm;
  onSubmit: (
    data: ArtworkForm
  ) => Promise<CreateArtworkResponse | UpdateArtworkResponse>;
  submitLabel?: string;
  successMessage?: string;
}

export function ArtworkForm({
  initialValues,
  onSubmit,
  submitLabel = 'Enregistrer',
  successMessage = 'Notice enregistrée avec succès !',
}: ArtworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        toast.error(
          result.error || "Erreur lors de l'enregistrement de la notice"
        );
      }
    } catch (error) {
      console.error('Error saving artwork:', error);
      setIsSubmitting(false);
      toast.error(
        'Une erreur inattendue est survenue. Vérifiez la console pour plus de détails.'
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Debug: Show form errors in development */}
        {process.env.NODE_ENV === 'development' &&
          Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h4 className="text-red-800 font-semibold mb-2">
                Erreurs de validation:
              </h4>
              <ul className="text-red-700 text-sm">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {error?.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

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
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                    onChange={(e) => field.onChange(e.target.value || null)}
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
                <RichTextEditor
                  value={field.value || ''}
                  onChange={(val) => field.onChange(val)}
                />
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
                <Textarea
                  placeholder="Bibliographie et sources..."
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ''} // Ensure controlled input
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
                <ImageUpload
                  images={field.value}
                  onChange={field.onChange}
                  maxImages={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
