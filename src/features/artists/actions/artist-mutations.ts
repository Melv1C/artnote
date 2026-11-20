import { requirePermission } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { ArtistFormSchema, UpdateArtistSchema, type ArtistForm } from '@/schemas/artist';
import { emptyToNull, IdSchema } from '@/schemas/common';
import { createServerFn } from '@tanstack/react-start';

const requireArtistManager = requirePermission({ artist: ['manage'] });

const toArtistData = (form: ArtistForm) => ({
  firstName: form.firstName,
  lastName: form.lastName,
  birthDate: form.birthDate ? new Date(form.birthDate) : null,
  deathDate: form.deathDate ? new Date(form.deathDate) : null,
  biography: emptyToNull(form.biography),
});

export const createArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator(ArtistFormSchema)
  .handler(async ({ data, context: { user } }) => {
    await prisma.artist.create({
      data: { ...toArtistData(data), createdById: user.id, updatedById: user.id },
    });
  });

export const updateArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator(UpdateArtistSchema)
  .handler(async ({ data: { id, ...form }, context: { user } }) => {
    await prisma.artist.update({
      where: { id },
      data: { ...toArtistData(form), updatedById: user.id },
    });
  });

export const deleteArtist = createServerFn({ method: 'POST' })
  .middleware([requireArtistManager])
  .validator(IdSchema)
  .handler(async ({ data: artistId }) => {
    await prisma.artist.delete({ where: { id: artistId } });
  });
