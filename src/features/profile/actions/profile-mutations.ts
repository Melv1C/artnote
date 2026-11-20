import { requireAuth } from '@/lib/auth-functions';
import { readImageUpload, uploadPublicImage } from '@/lib/image-upload';
import { prisma } from '@/lib/prisma';
import { emptyToNull } from '@/schemas/common';
import { UserProfileFormSchema, UserSchema } from '@/schemas/user';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

/** Update the signed-in user's name, bio and CV link. */
export const updateProfile = createServerFn({ method: 'POST' })
  .middleware([requireAuth])
  .validator(UserProfileFormSchema)
  .handler(async ({ data, context: { user } }) =>
    UserSchema.parse(
      await prisma.user.update({
        where: { id: user.id },
        data: { name: data.name, bio: emptyToNull(data.bio), cv: emptyToNull(data.cv) },
      }),
    ),
  );

/** Upload a new avatar for the signed-in user. */
export const uploadAvatar = createServerFn({ method: 'POST' })
  .middleware([requireAuth])
  .validator(z.instanceof(FormData))
  .handler(async ({ data: formData, context: { user } }) => {
    const { file } = readImageUpload(formData);
    const blob = await uploadPublicImage('avatars', file);
    await prisma.user.update({ where: { id: user.id }, data: { image: blob.url } });
    return { url: blob.url };
  });
