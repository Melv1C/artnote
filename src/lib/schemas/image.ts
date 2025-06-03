import { z } from 'zod';

// =============================================================================
// BASE SCHEMA
// =============================================================================

export const ImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  alt: z.string().nullable(),
  caption: z.string().nullable(),
  width: z.number().positive().nullable(),
  height: z.number().positive().nullable(),
  size: z.number().positive().nullable(),
  mimeType: z.string().nullable(),
  isMain: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  updatedById: z.string(),
});

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

export const CreateImageSchema = ImageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
  updatedById: true,
});

export const UpdateImageSchema = CreateImageSchema.partial();

// =============================================================================
// FORM SCHEMAS
// =============================================================================

export const ImageFormSchema = z.object({
  url: z.string().url('URL invalide'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.coerce.number().positive('La largeur doit être positive').optional(),
  height: z.coerce
    .number()
    .positive('La hauteur doit être positive')
    .optional(),
  size: z.coerce.number().positive('La taille doit être positive').optional(),
  mimeType: z.string().optional(),
  isMain: z.boolean().default(false),
});

// Upload form schema for handling file uploads
export const ImageUploadFormSchema = z.object({
  file: z.instanceof(File, { message: 'Un fichier est requis' }),
  alt: z.string().optional(),
  caption: z.string().optional(),
  isMain: z.boolean().default(false),
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Image = z.infer<typeof ImageSchema>;
export type CreateImage = z.infer<typeof CreateImageSchema>;
export type UpdateImage = z.infer<typeof UpdateImageSchema>;
export type ImageForm = z.infer<typeof ImageFormSchema>;
export type ImageUploadForm = z.infer<typeof ImageUploadFormSchema>;
