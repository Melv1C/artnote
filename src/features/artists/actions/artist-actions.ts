import { createServerFn } from '@tanstack/react-start';
import { requirePermission } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtistFormSchema } from '@/schemas/artist';

const requireArtistManager = requirePermission({ artist: ['manage'] });

export const createArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData, context: { user } }) => {
    try {
      // Parse form data
      const data = ArtistFormSchema.parse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        birthDate: formData.get('birthDate') || undefined,
        deathDate: formData.get('deathDate') || undefined,
        biography: formData.get('biography') || undefined,
      });

      // Create artist
      await prisma.artist.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          deathDate: data.deathDate ? new Date(data.deathDate) : null,
          biography: data.biography || null,
          createdById: user.id,
          updatedById: user.id,
        },
      });
    } catch (error) {
      console.error('Error creating artist:', error);
      throw error;
    }
  });

export const updateArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData, context: { user } }) => {
    const artistId = String(formData.get('artistId'));
    try {
      // Parse form data
      const data = ArtistFormSchema.parse({
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        birthDate: formData.get('birthDate') || undefined,
        deathDate: formData.get('deathDate') || undefined,
        biography: formData.get('biography') || undefined,
      });

      // Update artist
      await prisma.artist.update({
        where: { id: artistId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          deathDate: data.deathDate ? new Date(data.deathDate) : null,
          biography: data.biography || null,
          updatedById: user.id,
        },
      });
    } catch (error) {
      console.error('Error updating artist:', error);
      throw error;
    }
  });

export const deleteArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator((artistId: string) => artistId)
  .handler(async ({ data: artistId }) => {
    try {
      await prisma.artist.delete({
        where: { id: artistId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting artist:', error);
      throw error;
    }
  });
