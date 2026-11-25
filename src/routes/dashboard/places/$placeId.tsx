import { FormPage } from '@/components/layout/form-page';
import { PlaceForm } from '@/features/places/components/place-form';
import { fetchPlace } from '@/features/places/actions/place-queries';
import { pageTitle } from '@/lib/seo';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard/places/$placeId')({
  loader: ({ params }) => fetchPlace({ data: params.placeId }),
  head: () => ({ meta: [{ title: pageTitle('Modifier le lieu') }] }),
  component: EditPlacePage,
});

function EditPlacePage() {
  const place = Route.useLoaderData();
  return (
    <FormPage title={place.name} description="Modifier le lieu">
      <PlaceForm place={place} />
    </FormPage>
  );
}
