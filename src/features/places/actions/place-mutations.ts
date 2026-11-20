import { requirePermission } from '@/lib/auth-functions';
import { prisma } from '@/lib/prisma';
import { orNotFound } from '@/lib/prisma-errors';
import { emptyToNull, IdSchema } from '@/schemas/common';
import { PlaceFormSchema, UpdatePlaceSchema, type PlaceForm } from '@/schemas/place';
import { createServerFn } from '@tanstack/react-start';

const requirePlaceManager = requirePermission({ place: ['manage'] });

const toPlaceData = (form: PlaceForm) => ({
  name: form.name,
  type: form.type,
  address: emptyToNull(form.address),
  city: emptyToNull(form.city),
  country: emptyToNull(form.country),
  latitude: form.latitude ?? null,
  longitude: form.longitude ?? null,
  website: emptyToNull(form.website),
  description: emptyToNull(form.description),
});

export const createPlace = createServerFn({ method: 'POST' })
  .middleware([requirePlaceManager])
  .validator(PlaceFormSchema)
  .handler(async ({ data, context: { user } }) => {
    await prisma.place.create({
      data: { ...toPlaceData(data), createdById: user.id, updatedById: user.id },
    });
  });

export const updatePlace = createServerFn({ method: 'POST' })
  .middleware([requirePlaceManager])
  .validator(UpdatePlaceSchema)
  .handler(async ({ data: { id, ...form }, context: { user } }) => {
    await orNotFound(
      prisma.place.update({
        where: { id },
        data: { ...toPlaceData(form), updatedById: user.id },
      }),
    );
  });

export const deletePlace = createServerFn({ method: 'POST' })
  .middleware([requirePlaceManager])
  .validator(IdSchema)
  .handler(async ({ data: placeId }) => {
    await orNotFound(prisma.place.delete({ where: { id: placeId } }));
  });
