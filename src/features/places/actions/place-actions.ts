'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { PlaceFormSchema } from '@/schemas/place';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPlace(formData: FormData) {
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

    revalidatePath('/dashboard/places');
  } catch (error) {
    console.error('Error creating place:', error);
    throw error;
  }
  
  redirect('/dashboard/places');
}

export async function updatePlace(placeId: string, formData: FormData) {
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

    revalidatePath('/dashboard/places');
  } catch (error) {
    console.error('Error updating place:', error);
    throw error;
  }
  
  redirect('/dashboard/places');
}

export async function deletePlace(placeId: string) {
  try {
    await getRequiredUser();

    await prisma.place.delete({
      where: { id: placeId },
    });

    revalidatePath('/dashboard/places');
    return { success: true };
  } catch (error) {
    console.error('Error deleting place:', error);
    throw error;
  }
}
