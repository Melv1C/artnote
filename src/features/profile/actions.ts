import { createServerFn } from '@tanstack/react-start';
import { requireAuth } from '@/lib/auth-functions';
import { readImageFile, uploadPublicImage } from '@/lib/image-upload';
import { prisma } from '@/lib/prisma';
import { type User, UserProfileFormSchema, UserSchema, type UserProfileForm } from '@/schemas/user';

export type UpdateProfileResponse = {
  success: boolean;
  data?: User;
  error?: string;
};

export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([requireAuth])
  .validator((data: UserProfileForm) => data)
  .handler(async ({ data, context: { user } }): Promise<UpdateProfileResponse> => {
    try {
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
  });

export const uploadAvatar = createServerFn({ method: 'POST' })
  .middleware([requireAuth])
  .validator((formData: FormData) => formData)
  .handler(async ({ data: formData, context: { user } }) => {
    const blob = await uploadPublicImage(`avatars/${user.id}`, readImageFile(formData));

    await prisma.user.update({
      where: { id: user.id },
      data: { image: blob.url, updatedAt: new Date() },
    });

    return { url: blob.url };
  });
