'use server';

import { getRequiredUser } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import {
  UserProfileFormSchema,
  UserSchema,
  type UserProfileForm,
} from '@/schemas/user';
import { revalidatePath } from 'next/cache';

export type UpdateProfileResponse = {
  success: boolean;
  data?: typeof UserSchema._type;
  error?: string;
};

export async function updateProfile(
  data: UserProfileForm
): Promise<UpdateProfileResponse> {
  try {
    const user = await getRequiredUser();
    console.log(data);
    const validatedData = UserProfileFormSchema.parse(data);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: validatedData.name,
        bio: validatedData.bio ?? null,
        cv: validatedData.cv ?? null,
      },
    });

    return { success: true, data: UserSchema.parse(updatedUser) };
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Une erreur inattendue s'est produite" };
  }
}
