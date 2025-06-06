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
import { ArtworkStatusSchema } from '@/schemas';
import { ArtworkFormSchema, type ArtworkForm } from '@/schemas/artwork';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CreateArtworkResponse } from '../actions';

interface ArtworkFormProps {
  initialValues?: Partial<ArtworkForm>;
  createArtwork: (data: ArtworkForm) => Promise<CreateArtworkResponse>;
  submitLabel?: string;
}

export function ArtworkForm({
  initialValues,
  createArtwork,
  submitLabel = 'Enregistrer',
}: ArtworkFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ArtworkForm>({
    resolver: zodResolver(ArtworkFormSchema),
    defaultValues: {
      title: '',
      creationYear: '',
      medium: '',
      dimensions: '',
      notice: '',
      sources: '',
      status: ArtworkStatusSchema.Values.DRAFT,
      ...initialValues,
    },
  });

  const onSubmit = async (data: ArtworkForm) => {
    try {
      setIsSubmitting(true);
      const result = await createArtwork(data);

      if (result.success) {
        toast.success('Notice créée avec succès !');
        router.push('/dashboard/artworks');
      } else {
        setIsSubmitting(false);
        toast.error(result.error || 'Erreur lors de la création de la notice');
      }
    } catch (error) {
      console.error('Error creating artwork:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <Input placeholder="2023, XIXe siècle..." {...field} />
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
                  <Input placeholder="Huile sur toile, Bronze..." {...field} />
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
                  <Input placeholder="100 x 80 cm" {...field} />
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
                <Textarea
                  placeholder="Contenu de la notice explicative..."
                  className="min-h-[200px]"
                  {...field}
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
