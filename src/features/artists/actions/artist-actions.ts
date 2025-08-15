'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { ArtistFormSchema } from '@/schemas/artist';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createArtist(formData: FormData) {
  try {
    const user = await getRequiredUser();

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

  redirect('/dashboard/artists');
}

export async function updateArtist(artistId: string, formData: FormData) {
  try {
    const user = await getRequiredUser();

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

    revalidatePath('/dashboard/artists');
  } catch (error) {
    console.error('Error updating artist:', error);
    throw error;
  }

  redirect('/dashboard/artists');
}

export async function deleteArtist(artistId: string) {
  try {
    await getRequiredUser();

    await prisma.artist.delete({
      where: { id: artistId },
    });

    revalidatePath('/dashboard/artists');
    return { success: true };
  } catch (error) {
    console.error('Error deleting artist:', error);
    throw error;
  }
}
