import { createServerFn } from '@tanstack/react-start';
import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { PlaceFormSchema } from '@/schemas/place';

export const createPlace = createServerFn({ method: 'POST' })
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    try {
      const user = await getRequiredUser();

      // Parse form data
      const data = PlaceFormSchema.parse({
        name: formData.get('name'),
        type: formData.get('type'),
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        country: formData.get('country') || undefined,
        latitude: formData.get('latitude')
          ? parseFloat(formData.get('latitude') as string)
          : undefined,
        longitude: formData.get('longitude')
          ? parseFloat(formData.get('longitude') as string)
          : undefined,
        website: formData.get('website') || undefined,
        description: formData.get('description') || undefined,
      });

      // Create place
      await prisma.place.create({
        data: {
          ...data,
          createdById: user.id,
          updatedById: user.id,
        },
      });
    } catch (error) {
      console.error('Error creating place:', error);
      throw error;
    }
  });

export const updatePlace = createServerFn({ method: 'POST' })
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData }) => {
    const placeId = String(formData.get('placeId'));
    try {
      const user = await getRequiredUser();

      // Parse form data
      const data = PlaceFormSchema.parse({
        name: formData.get('name'),
        type: formData.get('type'),
        address: formData.get('address') || undefined,
        city: formData.get('city') || undefined,
        country: formData.get('country') || undefined,
        latitude: formData.get('latitude')
          ? parseFloat(formData.get('latitude') as string)
          : undefined,
        longitude: formData.get('longitude')
          ? parseFloat(formData.get('longitude') as string)
          : undefined,
        website: formData.get('website') || undefined,
        description: formData.get('description') || undefined,
      });

      // Update place
      await prisma.place.update({
        where: { id: placeId },
        data: {
          ...data,
          updatedById: user.id,
        },
      });
    } catch (error) {
      console.error('Error updating place:', error);
      throw error;
    }
  });

export const deletePlace = createServerFn({ method: 'POST' })
  .validator((placeId: string) => placeId)
  .handler(async ({ data: placeId }) => {
    try {
      await getRequiredUser();

      await prisma.place.delete({
        where: { id: placeId },
      });
      return { success: true };
    } catch (error) {
      console.error('Error deleting place:', error);
      throw error;
    }
  });
